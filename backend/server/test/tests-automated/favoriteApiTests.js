process.env.NODE_ENV = "test"; // This will prevent the backend from listening to port 8095 when running tests.


const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server'); // Your Express app instance
const { connect, closeDatabase, clearDatabase } = 
require('../tests-continuous-integration/test-config');


// Configure Chai to use the Chai HTTP plugin
chai.use(chaiHttp);
const expect = chai.expect;


// Run before all tests
before(async () => {
  await connect();
});


// Run after all tests
after(async () => {
  await closeDatabase();
});


// Run before each test
beforeEach(async () => {
  await clearDatabase();
});


describe('Regression Tests: Favorite API', () => {
  // Test for GET request to '/favorites/:username'
  it('should get user information', (done) => {
    chai
      .request(app)
      .post('/favorites/create')
      .send({username: "tochiamanze", favoriteName: "455", direction: "Inbound"})
      .end((err, res) => {
        if (err) {
            console.log(err);
        }
        console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object"); 
        done();
      });
  });
});