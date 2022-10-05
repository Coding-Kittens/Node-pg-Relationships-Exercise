const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError");



router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, industry, comp_code FROM industries LEFT JOIN company_industries ON code=company_industries.industry_code");
    return res.json({ industries:{
      code: result.rows[0].code,
      industry: result.rows[0].industry,
      companies: result.rows.map((r) => r.comp_code)
    }
    });
  } catch (e) {
    return next(e);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const {code,industry} = req.body;

    const result = await db.query(
      `INSERT INTO industries (code,industry) Values($1,$2) RETURNING *`,
      [code,industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});


router.post("/:code/company", async (req, res, next) => {
  try {
    const {code} = req.params;
    const {comp_code} = req.body;


    const check = await db.query('SELECT code FROM industries WHERE code=$1',[code]);

    if (check.rows.length === 0) {
        throw new ExpressError(`Industry with code of ${code} not found!`, 404);
      }

    const result = await db.query(
      `INSERT INTO company_industries (industry_code, comp_code) Values($1,$2) RETURNING *`,
      [code, comp_code]
    );

    return res.status(201).json({company_industry: result.rows[0]});
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
