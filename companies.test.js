process.env.NODE_ENV = 'test';
const request = require('supertest')
const app = require('./app')
const db = require('./db')

beforeEach(async () => {
let company = db.query(
    `INSERT INTO companies (code,name,description) Values('testcode','testName','this is a test')`
  );

let invoice = db.query(`INSERT INTO invoices (id,comp_Code, amt, paid, paid_date)
    VALUES (394,'testcode', 100, false, null)`)


let industry = db.query(`INSERT INTO industries (code, industry)
  VALUES ('acct', 'Accounting')`)


let company_industry = db.query(`INSERT INTO company_industries (comp_code, industry_code)
  VALUES ('testcode','acct')`)

  await company;
  await invoice;
  await industry;
  await company_industry;

});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM industries`);
  await db.query(`DELETE FROM company_industries`);
});

afterAll(async () => {
  await db.end();
});


describe("Test Get", () => {
  test("Get all", async () => {

    await db.query(
      `INSERT INTO companies (code,name,description) Values('testcode2','testName2','this is test 2')`
    );


    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        { code:'testcode', name:'testName'},
        { code:'testcode2', name:'testName2' },
      ],
    });
  });

  test("Get by code", async () => {
    const res = await request(app).get("/companies/testcode");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company:
    {code: 'testcode',
    name: 'testName',
    description: 'this is a test',
    invoices: [394],
    industries: ['Accounting']}
   });
  });

  test("Get by code should return 404 if code not found", async () => {
    const res = await request(app).delete("/companies/notACode");
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Post", () => {
  test("Create new", async () => {
    const res = await request(app)
      .post("/companies")
      .send({name:'Test Name!', description:'newTest'});
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company:{code:'testname',name:'Test Name!',description:'newTest'}
    });
  });
});

describe("Test Put", () => {
  test("Update by code", async () => {
    const res = await request(app)
      .put("/companies/testcode")
      .send({ name: 'updatedName', description:'test update' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {code:'testcode',name:'updatedName',description:'test update'}
    });
  });


  test("Update by code should return 404 if code not found", async () => {
    const res = await request(app)
      .put("/companies/notACode")
      .send({ name: 'updatedName', description:'test update' });
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Delete", () => {
  test("Delete by code", async () => {
    const res = await request(app).delete("/companies/testcode");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });

  test("Delete by code should return 404 if code not found", async () => {
    const res = await request(app).delete("/companies/notACode");
    expect(res.statusCode).toBe(404);
  });
});
