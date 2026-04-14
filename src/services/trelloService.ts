export interface PDRTrelloPayload {
  machineTag: string
  machineDesignation: string | null
  pieceDesignation: string
  pieceReference: string
  quantite: number
  demandeur: string
  machineArret: boolean
}

const TRELLO_KEY = import.meta.env.VITE_TRELLO_KEY as string | undefined
const TRELLO_TOKEN = import.meta.env.VITE_TRELLO_TOKEN as string | undefined
const TRELLO_LIST_ID = import.meta.env.VITE_TRELLO_LIST_ID as string | undefined

export const trelloConfigured = Boolean(TRELLO_KEY && TRELLO_TOKEN && TRELLO_LIST_ID)

function buildCardName(payload: PDRTrelloPayload): string {
  return `PDR — ${payload.machineTag} — ${payload.pieceDesignation}`
}

function buildCardDescription(payload: PDRTrelloPayload): string {
  const lines = [
    '## Demande de Pièce De Rechange',
    '',
    `- **Machine** : ${payload.machineTag}${payload.machineDesignation ? ` (${payload.machineDesignation})` : ''}`,
    `- **Désignation de la pièce** : ${payload.pieceDesignation}`,
    `- **Référence** : ${payload.pieceReference || '—'}`,
    `- **Quantité** : ${payload.quantite}`,
    `- **Demandeur** : ${payload.demandeur}`,
    `- **Machine à l'arrêt** : ${payload.machineArret ? 'OUI' : 'NON'}`,
    '',
    `_Créée depuis PlanOT le ${new Date().toLocaleString('fr-FR')}_`,
  ]
  return lines.join('\n')
}

export async function sendPDRToTrello(payload: PDRTrelloPayload): Promise<{ id: string; url: string }> {
  if (!trelloConfigured) {
    throw new Error(
      "Trello non configuré : vérifiez VITE_TRELLO_KEY, VITE_TRELLO_TOKEN et VITE_TRELLO_LIST_ID."
    )
  }

  const params = new URLSearchParams({
    key: TRELLO_KEY as string,
    token: TRELLO_TOKEN as string,
    idList: TRELLO_LIST_ID as string,
    name: buildCardName(payload),
    desc: buildCardDescription(payload),
    pos: 'top',
  })

  const response = await fetch(`https://api.trello.com/1/cards?${params.toString()}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Échec de l'envoi Trello (${response.status}) : ${body || response.statusText}`
    )
  }

  const card = (await response.json()) as { id: string; url: string }
  return { id: card.id, url: card.url }
}
