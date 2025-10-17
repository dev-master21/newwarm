import { Router } from 'express';
import db from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const configs = await db.query(`
      SELECT config_key, config_value, config_type 
      FROM configs
    `);
    
    const configMap: any = {};
    configs.forEach((config: any) => {
      configMap[config.config_key] = config.config_value;
    });
    
    res.json({
      success: true,
      data: configMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching config'
    });
  }
});

export default router;