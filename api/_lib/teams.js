import { ensureColumn, query } from './db.js'

export async function ensureTeamsTable() {
  await query(`CREATE TABLE IF NOT EXISTS teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_name VARCHAR(150) NOT NULL,
    evp_agent_id BIGINT UNSIGNED NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY teams_team_name_unique (team_name),
    KEY teams_evp_agent_index (evp_agent_id),
    CONSTRAINT teams_evp_agent_foreign FOREIGN KEY (evp_agent_id) REFERENCES agents(id) ON DELETE SET NULL
  )`)
  await ensureColumn('teams', 'established_date', 'DATE NULL AFTER evp_agent_id')
  await ensureColumn('agents', 'sub_team', 'VARCHAR(150) NULL AFTER team')
  await query(`CREATE TABLE IF NOT EXISTS team_subteams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_id BIGINT UNSIGNED NOT NULL,
    subteam_name VARCHAR(150) NOT NULL,
    sd_agent_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY team_subteams_name_unique (team_id, subteam_name),
    KEY team_subteams_sd_index (sd_agent_id),
    CONSTRAINT team_subteams_team_foreign FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT team_subteams_sd_foreign FOREIGN KEY (sd_agent_id) REFERENCES agents(id) ON DELETE SET NULL
  )`)
}

export const teamSummaryQuery = `
  SELECT t.id, t.team_name AS teamName, t.evp_agent_id AS evpAgentId,
    DATE_FORMAT(t.established_date, '%Y-%m-%d') AS establishedDate, t.status,
    TRIM(CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, ''))) AS evpName,
    COALESCE(SUM(CASE WHEN a.role = 'Sales Director' AND a.status = 'Active' THEN 1 ELSE 0 END), 0) AS totalSd,
    COALESCE(SUM(CASE WHEN a.role = 'Agent' AND a.status = 'Active' THEN 1 ELSE 0 END), 0) AS totalHlc,
    COALESCE(SUM(CASE WHEN a.status = 'Active' THEN 1 ELSE 0 END), 0) AS totalMembers,
    t.created_at AS createdAt, t.updated_at AS updatedAt
  FROM teams t
  LEFT JOIN agents e ON e.id = t.evp_agent_id
  LEFT JOIN agents a ON a.team = t.team_name
  GROUP BY t.id, t.team_name, t.evp_agent_id, t.established_date, t.status, e.first_name, e.last_name, t.created_at, t.updated_at
`

export async function replaceSubteams(teamId, subteams = []) {
  await query(`DELETE FROM team_subteams WHERE team_id = :teamId`, { teamId })
  for (const item of subteams) {
    const subteamName = String(item.subteamName || '').trim().toUpperCase()
    if (!subteamName) continue
    await query(`INSERT INTO team_subteams (team_id, subteam_name, sd_agent_id) VALUES (:teamId, :subteamName, :sdAgentId)`, {
      teamId, subteamName, sdAgentId: item.sdAgentId || null,
    })
  }
}

export async function getSubteams(teamId) {
  return query(`SELECT s.id, s.subteam_name AS subteamName, s.sd_agent_id AS sdAgentId,
    TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))) AS sdName
    FROM team_subteams s LEFT JOIN agents a ON a.id = s.sd_agent_id
    WHERE s.team_id = :teamId ORDER BY s.subteam_name`, { teamId })
}
