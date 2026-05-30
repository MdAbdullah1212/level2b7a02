import { pool } from "../../db";
const createIssue = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { title, description, type } = req.body;
        const result = await pool.query(`INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [title, description, type, req.user.id]);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0],
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getAllIssues = async (req, res) => {
    try {
        const sort = req.query.sort || "newest";
        const type = req.query.type;
        const status = req.query.status;
        let query = "SELECT * FROM issues WHERE 1=1";
        const values = [];
        if (type) {
            values.push(type);
            query += ` AND type=$${values.length}`;
        }
        if (status) {
            values.push(status);
            query += ` AND status=$${values.length}`;
        }
        query +=
            sort === "oldest"
                ? " ORDER BY created_at ASC"
                : " ORDER BY created_at DESC";
        const issuesResult = await pool.query(query, values);
        const issues = issuesResult.rows;
        const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
        let users = [];
        if (reporterIds.length > 0) {
            const userResult = await pool.query(`SELECT id, name, role FROM users WHERE id = ANY($1)`, [reporterIds]);
            users = userResult.rows;
        }
        const userMap = new Map(users.map((u) => [u.id, u]));
        const final = issues.map((issue) => ({
            ...issue,
            reporter: userMap.get(issue.reporter_id) || null,
        }));
        res.json({
            success: true,
            message: "Issues retrieved successfully",
            data: final,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getSingleIssue = async (req, res) => {
    try {
        const id = req.params.id;
        const issueResult = await pool.query("SELECT * FROM issues WHERE id=$1", [
            id,
        ]);
        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const issue = issueResult.rows[0];
        const userResult = await pool.query("SELECT id, name, role FROM users WHERE id=$1", [issue.reporter_id]);
        res.json({
            success: true,
            message: "Issue retrieved successfully",
            data: {
                ...issue,
                reporter: userResult.rows[0] || null,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const patchIssue = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const id = req.params.id;
        const issueResult = await pool.query("SELECT * FROM issues WHERE id=$1", [
            id,
        ]);
        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const issue = issueResult.rows[0];
        if (req.user.role !== "maintainer") {
            if (issue.reporter_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized",
                });
            }
            if (issue.status !== "open") {
                return res.status(409).json({
                    success: false,
                    message: "Only open issues can be updated",
                });
            }
        }
        const { title, description, type } = req.body;
        const fields = [];
        const values = [];
        let i = 1;
        if (title) {
            fields.push(`title=$${i++}`);
            values.push(title);
        }
        if (description) {
            fields.push(`description=$${i++}`);
            values.push(description);
        }
        if (type) {
            fields.push(`type=$${i++}`);
            values.push(type);
        }
        values.push(id);
        const query = `
      UPDATE issues
      SET ${fields.join(", ")}, updated_at=NOW()
      WHERE id=$${i}
      RETURNING *
    `;
        const updated = await pool.query(query, values);
        res.json({
            success: true,
            message: "Issue updated successfully",
            data: updated.rows[0],
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const deleteIssue = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "maintainer") {
            return res.status(403).json({
                success: false,
                message: "Only maintainers can delete issues",
            });
        }
        const id = req.params.id;
        const result = await pool.query("DELETE FROM issues WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        res.json({
            success: true,
            message: "Issue deleted successfully",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
export const issuesController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    patchIssue,
    deleteIssue,
};
//# sourceMappingURL=issues.controller.js.map