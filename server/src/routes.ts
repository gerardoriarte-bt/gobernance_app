import { Router } from 'express';
import { pool } from './db';

const router = Router();

// --- Tenants ---
router.get('/tenants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/tenants', async (req, res) => {
  const { id, name } = req.body;
  try {
    await pool.query('INSERT INTO tenants (id, name) VALUES ($1, $2)', [id, name]);
    res.status(201).json({ id, name });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/tenants/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('UPDATE tenants SET name = $1 WHERE id = $2', [name, id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/tenants/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tenants WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Clients ---
router.get('/clients', async (req, res) => {
  const { tenantId } = req.query;
  try {
    let query = 'SELECT * FROM clients';
    const params = [];
    if (tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(tenantId);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    // Return with camelCase for frontend compatibility (or map it)
    const mapped = result.rows.map(r => ({ ...r, tenantId: r.tenant_id }));
    res.json(mapped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/clients', async (req, res) => {
  const { id, name, tenantId } = req.body;
  try {
    await pool.query('INSERT INTO clients (id, name, tenant_id) VALUES ($1, $2, $3)', [id, name, tenantId]);
    res.status(201).json({ id, name, tenantId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('UPDATE clients SET name = $1 WHERE id = $2', [name, id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Taxonomies ---
router.get('/taxonomies', async (req, res) => {
  const { clientId } = req.query;
  try {
    let query = 'SELECT * FROM taxonomies';
    const params = [];
    if (clientId) {
      query += ' WHERE client_id = $1';
      params.push(clientId);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    
    // Map back to frontend structure
    const mapped = result.rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      clientId: row.client_id,
      campaignName: row.campaign_name,
      date: row.date_string, // we stored the string repr
      strings: row.generated_strings,
      values: row.values_data
    }));
    
    res.json(mapped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/taxonomies', async (req, res) => {
  const item = req.body;
  try {
    await pool.query(
      `INSERT INTO taxonomies 
      (id, tenant_id, client_id, campaign_name, date_string, generated_strings, values_data) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        item.id,
        item.tenantId,
        item.clientId,
        item.campaignName,
        item.date,
        JSON.stringify(item.strings),
        JSON.stringify(item.values)
      ]
    );
    res.status(201).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/taxonomies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM taxonomies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Users ---
router.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Map snake_case to camelCase
    const row = result.rows[0];
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      avatar: row.avatar,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/users/sync', async (req, res) => {
  const { id, email, name, role, avatar } = req.body;
  
  try {
    // Check if user exists
    const check = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    
    if (check.rows.length === 0) {
      // Create new
      await pool.query(
        `INSERT INTO users (id, email, name, role, avatar, last_login) 
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [id, email, name, role || 'trafficker', avatar]
      );
    } else {
      // Update existing
      await pool.query(
        `UPDATE users SET name = COALESCE($2, name), avatar = COALESCE($3, avatar), last_login = NOW() 
         WHERE id = $1 RETURNING *`,
        [id, name, avatar]
      );
    }
    
    // Fetch updated profile
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const row = result.rows[0];
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      avatar: row.avatar,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
    
    res.json(user);
  } catch (e: any) {
    console.error("Sync user error:", e);
    res.status(500).json({ error: e.message });
  }
});

export const taxonomyRouter = router;
