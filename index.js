const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const admin = require('./firebase-admin/admin');

const PORT = process.env.PORT || 8000;

const verifyToken = async (req, res) => {
  const idToken = req.headers.authorization;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken) {
      const uid = decodedToken.uid;
      res.set('Set-userId', uid);

      console.log(`decoded userId: ${uid} from ID Token: ${idToken.substring(0, 10)}...`);
      return res.status(204).send('ok')
    }
  } catch (e) {
    console.log('exception thrown while verifying token: ' + e.message)
  }

  return res.status(401).send('Unauthorized')
};

app.get('/verify-token', verifyToken);

app.listen(PORT, () => {
  console.log(`Server Running on port: ${PORT}`);
});

module.exports = app;
