
const env = require('dotenv');

env.config({path: './.env'});

const admin = require('../firebase-admin/admin');
const app = require('../index');

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

const rp = require('request-promise');

chai.use(chaiHttp);

const uid = 'test-uid';
let customToken = null;
let idToken = null;

describe('Token Test', () => {
  before(async () => {
    try {

      customToken = await admin.auth().createCustomToken(uid);

      const res = await rp({
        url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.FIREBASE_WEB_API_KEY}`,
        method: 'POST',
        body: {
          token: customToken,
          returnSecureToken: true,
        },
        json: true,
      });

      idToken = res.idToken;
    } catch (e) {
      console.log(e)
    }
  });

  it('GET /verify-token - happy path', done => {
    chai
    .request(app)
    .get('/verify-token')
    .set('Authorization', idToken)
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(204);
      expect(res.get('Set-userId')).to.eq(uid);
      expect(res.text).to.be.a('string');
      done();
    })
  });

  it('GET /verify-token - should return 401', done => {
    chai
    .request(app)
    .get('/verify-token')
    .set('Authorization', idToken.split("").reverse().join(""))
    .end((err, res) => {
      expect(res).to.have.status(401);
      expect(res.get('Set-userId')).to.be.undefined;
      expect(res.text).to.be.a('string');
      done();
    })
  })
});
