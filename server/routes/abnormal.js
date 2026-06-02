const express = require('express');
const router = express.Router();
const { Database } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { abnormalType, status, keyword } = req.query;
    let sql = 'SELECT * FROM abnormal_records WHERE 1=1';
    const params = [];
    
    if (abnormalType && abnormalType !== 'all') {
      sql += ' AND abnormal_type = ?';
      params.push(abnormalType);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (keyword) {
      sql += ' AND (student_name LIKE ? OR student_no LIKE ?)';
      const search = `%${keyword}%`;
      params.push(search);
      params.push(search);
    }
    
    sql += ' ORDER BY report_time DESC';
    const records = await Database.all(sql, params);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取异常记录失败:', error);
    res.status(500).json({ success: false, message: '获取异常记录失败', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const urgentCount = await Database.get('SELECT COUNT(*) as count FROM abnormal_records WHERE status = "pending" AND abnormal_type = "fever"');
    const feverCount = await Database.get('SELECT COUNT(*) as count FROM abnormal_records WHERE abnormal_type = "fever"');
    const allergyCount = await Database.get('SELECT COUNT(*) as count FROM abnormal_records WHERE abnormal_type = "allergy"');
    const otherCount = await Database.get('SELECT COUNT(*) as count FROM abnormal_records WHERE abnormal_type NOT IN ("fever", "allergy")');
    
    res.json({
      success: true,
      data: {
        urgentCount: urgentCount.count,
        feverCount: feverCount.count,
        allergyCount: allergyCount.count,
        otherCount: otherCount.count
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await Database.get('SELECT * FROM abnormal_records WHERE id = ?', [req.params.id]);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取详情失败', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { student_id, student_name, student_no, class_id, class_name, abnormal_type, symptoms, temperature } = req.body;
    const result = await Database.run(
      `INSERT INTO abnormal_records (student_id, student_name, student_no, class_id, class_name, abnormal_type, symptoms, temperature, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [student_id, student_name, student_no, class_id, class_name, abnormal_type, symptoms, temperature]
    );
    res.json({ success: true, message: '添加成功', data: { id: result.lastID } });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加失败', error: error.message });
  }
});

router.put('/:id/handle', async (req, res) => {
  try {
    const { id } = req.params;
    const { handling_measure, remarks, handled_by } = req.body;
    const now = new Date().toISOString();
    await Database.run(
      `UPDATE abnormal_records 
       SET status = 'completed', handling_measure = ?, remarks = ?, handled_by = ?, handled_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [handling_measure, remarks, handled_by, now, id]
    );
    res.json({ success: true, message: '处理完成' });
  } catch (error) {
    res.status(500).json({ success: false, message: '处理失败', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { abnormal_type, symptoms, temperature, status } = req.body;
    await Database.run(
      `UPDATE abnormal_records 
       SET abnormal_type = ?, symptoms = ?, temperature = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [abnormal_type, symptoms, temperature, status, id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Database.run('DELETE FROM abnormal_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

module.exports = router;