const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

app.post('/api/query', (req, res) => {
  const { query } = req.body;
  console.log('Получен запрос:', query);

  const pythonProcess = spawn('python', [
    'C:/Users/early/Desktop/hack/samo-app/Neiro_chat/Neiro_chat/Run.py',
    query,
  ]);

  pythonProcess.stdout.on('data', (data) => {
    console.log('Сырые данные от Python:', data.toString('utf-8'));
    try {
      const result = JSON.parse(data.toString('utf-8'));
      console.log('Ответ от Python (JSON):', result);
      res.json(result);
    } catch (error) {
      console.error('Ошибка разбора JSON:', error);
      if (!res.headersSent) {
        res.status(500).json({ answer: 'Ошибка при обработке запроса. Пожалуйста, попробуйте снова.' });
      }
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Ошибка Python процесса:', data.toString());
    if (!res.headersSent) {
      res.status(500).json({
        answer: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.',
      });
    }
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0 && !res.headersSent) {
      console.error(`Процесс Python завершился с кодом ${code}`);
      res.status(500).json({
        answer: 'Произошла ошибка при выполнении Python процесса. Пожалуйста, попробуйте снова.',
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

app.post('/api/query', async (req, res) => {
  const { query, alternative } = req.body;
  let result;

  if (alternative) {
      result = await runPythonScript('Run.py', [query, "alternative"]);
  } else {
      result = await runPythonScript('Run.py', [query]);
  }

  res.json(result);
});
