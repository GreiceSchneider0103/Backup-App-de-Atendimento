import { createSign } from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

type TicketBackupRow = {
  id: string;
  nomeCliente: string;
  numeroVenda: string;
  empresa: string;
  canalMarketplace: string;
  motivo: string;
  statusTicket: string;
  statusReclamacao: string;
  valorReembolso: number;
  valorColeta: number;
  custosTotais: number;
  criadoEm: string;
  atualizadoEm: string;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(privateKey: string, header: Record<string, unknown>, payload: Record<string, unknown>) {
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerEncoded}.${payloadEncoded}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();

  const signature = signer.sign(privateKey, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${unsigned}.${signature}`;
}

function getSheetsEnv() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Tickets";

  if (!clientEmail || !privateKey || !spreadsheetId) return null;
  return { clientEmail, privateKey, spreadsheetId, sheetName };
}

async function getGoogleAccessToken() {
  const env = getSheetsEnv();
  if (!env) throw new Error("Integração Google Sheets não configurada");

  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    env.privateKey,
    { alg: "RS256", typ: "JWT" },
    {
      iss: env.clientEmail,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now
    }
  );

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    throw new Error(`Falha ao obter token Google: ${body}`);
  }

  const tokenPayload = await tokenResponse.json() as { access_token: string };
  return tokenPayload.access_token;
}

function toRowValues(ticket: TicketBackupRow) {
  return [[
    ticket.id,
    ticket.nomeCliente,
    ticket.numeroVenda,
    ticket.empresa,
    ticket.canalMarketplace,
    ticket.motivo,
    ticket.statusTicket,
    ticket.statusReclamacao,
    ticket.valorReembolso,
    ticket.valorColeta,
    ticket.custosTotais,
    ticket.criadoEm,
    ticket.atualizadoEm
  ]];
}

function extractRowNumberFromRange(updatedRange: string) {
  const match = updatedRange.match(/![A-Z]+(\d+):/);
  return match ? Number(match[1]) : null;
}

export function isGoogleSheetsBackupEnabled() {
  return getSheetsEnv() !== null;
}

export async function appendTicketBackupRow(ticket: TicketBackupRow) {
  const env = getSheetsEnv();
  if (!env) throw new Error("Integração Google Sheets não configurada");

  const token = await getGoogleAccessToken();
  const range = `${env.sheetName}!A:M`;
  const response = await fetch(
    `${GOOGLE_SHEETS_API_BASE}/${env.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: toRowValues(ticket) })
    }
  );

  if (!response.ok) {
    throw new Error(`Falha ao inserir linha no Sheets: ${await response.text()}`);
  }

  const body = await response.json() as { updates?: { updatedRange?: string } };
  const rowNumber = body.updates?.updatedRange ? extractRowNumberFromRange(body.updates.updatedRange) : null;
  if (!rowNumber) throw new Error("Não foi possível identificar a linha criada no Sheets");

  return { rowNumber };
}

async function findRowNumberByTicketId(ticketId: string) {
  const env = getSheetsEnv();
  if (!env) throw new Error("Integração Google Sheets não configurada");

  const token = await getGoogleAccessToken();
  const range = `${env.sheetName}!A:A`;
  const response = await fetch(`${GOOGLE_SHEETS_API_BASE}/${env.spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ticket no Sheets: ${await response.text()}`);
  }

  const body = await response.json() as { values?: string[][] };
  const values = body.values ?? [];
  const index = values.findIndex((row) => row[0] === ticketId);
  return index >= 0 ? index + 1 : null;
}

export async function updateTicketBackupRow(ticket: TicketBackupRow, backupSheetRowNumber?: number | null) {
  const env = getSheetsEnv();
  if (!env) throw new Error("Integração Google Sheets não configurada");

  const rowNumber = backupSheetRowNumber ?? await findRowNumberByTicketId(ticket.id);
  if (!rowNumber) {
    return appendTicketBackupRow(ticket);
  }

  const token = await getGoogleAccessToken();
  const range = `${env.sheetName}!A${rowNumber}:M${rowNumber}`;
  const response = await fetch(
    `${GOOGLE_SHEETS_API_BASE}/${env.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: toRowValues(ticket) })
    }
  );

  if (!response.ok) {
    throw new Error(`Falha ao atualizar linha no Sheets: ${await response.text()}`);
  }

  return { rowNumber };
}
