// print-agent-local/src/utils/textNormalizer.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * UTILITÁRIO: Normalização de texto para impressoras térmicas
 * Remove acentos e caracteres especiais que não são suportados por impressoras ESC/POS
 */

/**
 * Remove acentos e normaliza texto para impressoras térmicas
 * Mesmo algoritmo usado no backend (ReceiptGenerator.ts)
 *
 * @param {string} str - Texto a ser normalizado
 * @returns {string} Texto sem acentos e apenas caracteres ASCII
 *
 * @example
 * removeAccents('Impressão') // 'Impressao'
 * removeAccents('Estação: CAIXA-01') // 'Estacao: CAIXA-01'
 */
function removeAccents(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^\x00-\x7F]/g, '?');  // Substitui caracteres não-ASCII por ?
}

/**
 * Extrai estacao_id da API Key
 * Formato esperado: pka_{estacao_id}_{random_bytes}
 *
 * @param {string} apiKey - API Key no formato pka_*
 * @returns {string|null} ID da estação ou null se inválido
 *
 * @example
 * extractEstacaoIdFromApiKey('pka_caixa_01_899966_36fbffbf...') // 'caixa_01_899966'
 * extractEstacaoIdFromApiKey('invalid') // null
 */
function extractEstacaoIdFromApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return null;
  }

  // API Key formato: pka_{estacao_id}_{random}
  const parts = apiKey.split('_');

  // pka_caixa_01_899966_36fbffbf...
  // [0]=pka, [1]=caixa, [2]=01, [3]=899966, [4]=random...

  if (parts.length < 4 || parts[0] !== 'pka') {
    return null;
  }

  // Juntar tudo entre "pka_" e o último "_" (que é o random de 32 chars)
  // Assumindo que o random sempre tem exatamente 32 caracteres hexadecimais
  const lastPart = parts[parts.length - 1];

  // Se o último part tem exatamente 32 chars hex, é o random
  if (lastPart && lastPart.length === 32 && /^[a-f0-9]{32}$/.test(lastPart)) {
    // Pegar tudo exceto "pka" (primeiro) e random (último)
    return parts.slice(1, -1).join('_');
  }

  // Fallback: pegar tudo exceto "pka"
  return parts.slice(1).join('_');
}

module.exports = {
  removeAccents,
  extractEstacaoIdFromApiKey
};
