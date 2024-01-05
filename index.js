import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { PdfReader } from 'pdfreader';
import fs from 'fs';

fs.promises;

const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

//routes @Post /upload
app.post(
    '/upload',
    upload.fields([
        { name: 'file1', maxCount: 1 },
        { name: 'file2', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            function readPdfFile(filePath) {
                return new Promise((resolve, reject) => {
                    let data = '';
                    new PdfReader().parseFileItems(filePath, (err, item) => {
                        if (err) {
                            console.error('error:', err);
                            reject(err);
                        } else if (!item) {
                            resolve(data);
                        } else if (item.text) {
                            data += item.text;
                        }
                    });
                });
            }

            Promise.all([
                readPdfFile('uploads/file1.pdf'),
                readPdfFile('uploads/file2.pdf'),
            ])
                .then(([data1, data2]) => {
                    // console.log(data1, data2);
                    if (data1 === data2) {
                        console.log('Files are identical');
                        res.status(200).json({
                            code: 200,
                            message: 'Files are identical',
                            success: 'true',
                        });
                    } else {
                        console.log('Files are different');
                        res.status(200).json({
                            code: 200,
                            message: 'Files are different',
                            success: 'true',
                        });
                    }
                })
                .catch((err) => {
                    // console.error('Error reading PDF files:', err);
                    res.status(400).json({
                        code: 400,
                        message: 'Error reading PDF files',
                        success: 'false',
                        error: err,
                    });
                });
        } catch (error) {
            // console.error(error);
            res.status(500).json({
                code: 500,
                message: 'Internal Server Error',
                success: 'false',
            });
        }
    }
);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
