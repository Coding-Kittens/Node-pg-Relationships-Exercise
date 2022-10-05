const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError");
const slugify = require('slugify')



router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code,name FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `SELECT * FROM companies
       LEFT JOIN invoices ON code=invoices.comp_code
       WHERE code=$1`,
      [code]
    );

    const industries_result = await db.query(`SELECT industry FROM companies JOIN company_industries ON code=company_industries.comp_code JOIN industries ON industries.code=company_industries.industry_code WHERE companies.code=$1`,[code])

    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }

    return res.json({
      company: {
        code: result.rows[0].code,
        name: result.rows[0].name,
        description: result.rows[0].description,
        invoices: result.rows.map((r) => r.id),
        industries: industries_result.rows.map((r) => r.industry)
      }
    });
  } catch (e) {
    return next(e);
  }
});



router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;

    let code = slugify(name,{lower: true,remove: /\W/g});

    const result = await db.query(
      `INSERT INTO companies (code,name,description) Values($1,$2,$3) RETURNING *`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$2,description=$3  WHERE code=$1 RETURNING *`,
      [code, name, description]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
