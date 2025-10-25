// backend/src/config/multer.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Создаем директории если их нет
const uploadsDir = path.join(__dirname, '../../uploads');
const propertiesDir = path.join(uploadsDir, 'properties');
const photosDir = path.join(propertiesDir, 'photos');
const floorPlansDir = path.join(propertiesDir, 'floor-plans');

fs.ensureDirSync(photosDir);
fs.ensureDirSync(floorPlansDir);

// Storage для фотографий объектов
const propertyPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Storage для планировок
const floorPlanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, floorPlansDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Фильтр файлов (только изображения)
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Storage для VR панорам
const vrPanoramaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vrDir = path.join(uploadsDir, 'vr-panoramas')
    fs.ensureDirSync(vrDir)
    cb(null, vrDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

export const uploadVRPanorama = multer({
  storage: vrPanoramaStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB на файл
  },
  fileFilter: imageFilter
})

// Multer configuration
export const uploadPropertyPhotos = multer({
  storage: propertyPhotoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB на файл
    files: 50 // максимум 50 файлов за раз
  },
  fileFilter: imageFilter
});

export const uploadFloorPlan = multer({
  storage: floorPlanStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: imageFilter
});