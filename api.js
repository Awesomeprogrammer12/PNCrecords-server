const express = require("express");
const mysql = require("mysql2");
const app = express();
app.use(express.json());

console.log("DB_HOST set?", Boolean(process.env.DB_HOST));
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER set?", Boolean(process.env.DB_USER));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true
});

db.query("SELECT 1", (error) => {
  if (error) {
    console.error("MySQL connection failed:");
    console.error(error.code, error.message);
    return;
  }
  console.log("Connected to Aiven MySQL");
});
// Main route
app.get("/", (req, res) => {
    res.send("PNRecords API is running!");
});
// Authentication not post or get
app.post("/auth", (req, res) => {

    const { userId, password } = req.body;

    console.log("Login attempt:", userId);

    const sql = `
        SELECT user_id, password_hash, username, job
        FROM Users
        WHERE user_id = ?
    `;
    db.query(sql, [userId], (error, results) => {

        if (error) {
            console.error("Database error:", error.message);

            return res.status(500).json({
                success: false
            });
        }

        if (results.length === 0) {

            return res.json({
                success: false
            });
        }

        const user = results[0];

        if (password !== user.password_hash) {

            return res.json({
                success: false
            });
        }

        res.json({
            success: true,
            userId: user.user_id,
            username: user.username,
            userrole: user.job
        });

    });

});
//POSTS
//-----------------------------------------------
//POST amount_paid
app.post("/user/amount_paid",(req,res)=>{
    
    const {userId,prefix,value} = req.body;

    console.log("Updating amount paid by ",userId," ",prefix,"  ₦",value)
    var amount_owing 
    var total_amount_paid 
    var sql = `
        SELECT amount_owing ,total_amount_paid
        FROM UsersData
        WHERE user_id = ?
    `;
    db.query(sql, [userId], (error, results) => {
        
        if (error) {
            console.error("Database error:", error.message);
            return res.json({
                success: false
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false
            });
        }
        amount_owing =  Number(results[0].amount_owing);
        total_amount_paid =  Number(results[0].total_amount_paid);
        const num = Number(value)
        if(prefix === "+"){
            total_amount_paid = total_amount_paid + num
            amount_owing = amount_owing - num
            if ( num < 0 ||  amount_owing < 0 ||  total_amount_paid < 0) {
                return res.json({
                    success: false
                });
            }       
        }
        else if(prefix === "-"){
            total_amount_paid = total_amount_paid - num
            amount_owing = amount_owing + num
            if ( num < 0 ||  amount_owing < 0 ||  total_amount_paid < 0) {
                return res.json({
                    success: false
                });
            }       
        }else{
            return res.json({
                success: false
            });
        }
        sql = `
            UPDATE UsersData
            SET amount_owing = ?,
            total_amount_paid = ?
            WHERE user_id = ?
        `;

        db.query(sql, [amount_owing, total_amount_paid, userId], (err)=>{
            if (err) {
                console.error("Database error:", err.message);
                return res.json({
                    success: false
                });
            }
            if (results.length === 0) {
                return res.json({
                    success: false
                });
            }
            
            return res.json({
                success: true
            });
        });
    });
});
//POST stock_100
app.post("/user/stock_100",(req,res)=>{
    
    const {userId,prefix,value} = req.body;

    console.log("Updating stock ₦100"," ",prefix," ",value, " ",userId)

    var stock_100
    var sql = `
        SELECT stock_100 
        FROM UsersData
        WHERE user_id = ?
    `
    db.query(sql,[userId],(error,results)=>{   

        if (error) {
            console.error("Database error:", error.message);
            return res.json({
                success: false
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false
            });
        }

        stock_100 = results[0].stock_100;

        if(prefix === "+"){
            stock_100 = stock_100 + value
            if ( value < 0 || stock_100 < 0 ) {
                console.error(stock_100,value, " is < 0")
                return res.json({
                    success: false
                });
            }       
        }
  
        else if(prefix === "-"){
            stock_100 = stock_100 - value   
            if ( value < 0 || stock_100 < 0 ) {
                console.error(stock_100,value, " is < 0 -" )
                return res.json({
                    success:false
                })
            }
        }   
        else{
            console.error(stock_100,value, " invalid prefix")
            return res.json({
                success: false
            });
        }
        sql = `
            UPDATE UsersData
            SET  stock_100 = ?
            WHERE user_id = ?
        `;
        db.query(sql,[stock_100,userId],(err)=>{
            if (err) {
                console.error("Database error:", err.message);
                return res.json({
                    success: false
                });
            }
            return res.json({
                success: true
            });
        });
        
    })
});
//POST stock_500
app.post("/user/stock_500",(req,res)=>{
    
    const {userId,prefix,value} = req.body;

    console.log("Updating stock ₦500"," ",prefix," ",value, " ",userId)

    var stock_500
    var sql = `
        SELECT stock_500 
        FROM UsersData
        WHERE user_id = ?
    `
    db.query(sql,[userId],(error,results)=>{   

        if (error) {
            console.error("Database error:", error.message);
            return res.json({
                success: false
            });
        }

        if (results.length === 0) {
            console.error("Database error: results length 0");
            return res.json({
                success: false
            });
        }

        stock_500 = results[0].stock_500;

        if(prefix === "+"){
            stock_500 = stock_500 + value
            
            if (value < 0 || stock_500 < 0 ) {
                console.error(stock_500,value, " is < 0 5")
                return res.json({
                    success: false
                });
            }
        }
  
        else if(prefix === "-"){
            stock_500 = stock_500 - value   
            if ( value < 0  || stock_500 < 0 ) {
                console.error(stock_500,value, " is < 0 5-")
                return res.json({
                    success: false
                });
            }
        }   
        else{
            console.error(stock_500,value, " invalid prefix")
            return res.json({
                success: false
            });
        }
        sql = `
            UPDATE UsersData
            SET  stock_500 = ?
            WHERE user_id = ?
        `;
        db.query(sql,[stock_500,userId],(err)=>{
            if (err) {
                console.error("Database error:", err.message);
                return res.json({
                    success: false
                });
            }
            return res.json({
                success: true
            });
        });
    })
});
//POST amount_owing
app.post("/user/amount_owing",(req,res)=>{
    
    const {userId,prefix,value} = req.body;

    console.log("Updating amount_owing "," ",prefix," ",value, " ",userId)

    var amount_owing
    var sql = `
        SELECT amount_owing 
        FROM UsersData
        WHERE user_id = ?
    `
    db.query(sql,[userId],(error,results)=>{   

        if (error) {
            console.error("Database error:", error.message);
            return res.json({
                success: false
            });
        }

        if (results.length === 0) {
            console.error("Database error: results length 0");
            return res.json({
                success: false
            });
        }

        amount_owing = Number(results[0].amount_owing);
        const num = Number(value)
        if(prefix === "+"){
            amount_owing = amount_owing + num
            
            if (num < 0 || amount_owing < 0 ) {
                console.error(amount_owing,value, " is < 0 5")
                return res.json({
                    success: false
                });
            }
        }
  
        else if(prefix === "-"){
            amount_owing = amount_owing - num   
            if ( num < 0  || amount_owing < 0 ) {
                console.error(amount_owing,value, " is < 0 5-")
                return res.json({
                    success: false
                });
            }
        }   
        else{
            console.error(amount_owing,value, " invalid prefix")
            return res.json({
                success: false
            });
        }
        sql = `
            UPDATE UsersData
            SET  amount_owing = ?
            WHERE user_id = ?
        `;
        db.query(sql,[amount_owing,userId],(err)=>{
            if (err) {
                console.error("Database error:", err.message);
                return res.json({
                    success: false
                });
            }
            return res.json({
                success: true
            });
        });
    })
});
//POST  actions
app.post("/user/actions",(req,res)=>{
    
    const {userId,action} = req.body;

    console.log("Updating actions table "," ",userId," | ",action)

    var sql = `
        INSERT INTO ActionsTable (user_id,act)
        VALUES(?,?)
    `
    db.query(sql,[userId,action],(error)=>{   

        if (error) {
            console.error("Database error:", error.message);
            return res.json({
                success: false
            });
        }
        return res.json({
            success: true
        });

    })
});
//GET
//------------------------------------------------
//GET Stock
app.get("/user/stock", (req,res)=>{

    const {userId} = req.query;

    console.log("GET stock ",userId)
    var stock_100var 
    var stock_500var 
    const sql = `
        SELECT stock_100 ,stock_500
        FROM UsersData
        WHERE user_id = ?
    `;

    db.query(sql, [userId] , (error, results) => {   

        if (error) {
            console.error("Database error:", error.message);
        
            return res.status(500).json({
                success: false
            });
        }

        if (results.length === 0) {
            console.error(" SQL refused to respond. ",results,userId)

            return res.json({
                success: false
            });
        }

        const stock = results[0]

        stock_100var = stock.stock_100;
        stock_500var = stock.stock_500;

        console.log(stock_100var," ",stock_500var, " retrieved succesfully")
        
        return res.json({
            success: true,
            stock_100:stock_100var,
            stock_500:stock_500var
        });
    });    
});
//GET amount_owing
app.get("/user/amount_owing", (req,res)=>{

    const {userId} = req.query;

    console.log("GET amount_owing ",userId)
    const sql = `
        SELECT amount_owing 
        FROM UsersData
        WHERE user_id = ?
    `;

    db.query(sql, [userId] , (error, results) => {   

        if (error) {
            console.error("Database error:", error.message);
        
            return res.status(500).json({
                success: false
            });
        }

        if (results.length === 0) {
            console.error(" SQL refused to respond. ",results,userId)

            return res.json({
                success: false
            });
        }

        const amount_owing = Number(results[0].amount_owing )

        console.log(amount_owing," ",amount_owing, " retrieved succesfully")
        
        return res.json({
            success: true,
            amount_owing:amount_owing
        });
    });    
});
//GET total_amount_paid
app.get("/user/total_amount_paid", (req,res)=>{

    const {userId} = req.query;

    console.log("GET total_amount_paid ",userId)
    const sql = `
        SELECT total_amount_paid 
        FROM UsersData
        WHERE user_id = ?
    `;

    db.query(sql, [userId] , (error, results) => {   

        if (error) {
            console.error("Database error:", error.message);
        
            return res.status(500).json({
                success: false
            });
        }

        if (results.length === 0) {
            console.error(" SQL refused to respond. ",results,userId)

            return res.json({
                success: false
            });
        }

        const total_amount_paid = Number(results[0].total_amount_paid)

        console.log(total_amount_paid," ",total_amount_paid, " retrieved succesfully")
        
        return res.json({
            success: true,
            total_amount_paid:total_amount_paid
        });
    });    
});
//GET actions
app.get("/user/actions", (req, res) => {

    const { userId } = req.query;

    console.log("Getting actions for:", userId);

    const sql = `
        SELECT DATE_FORMAT(datentime, '%Y-%m-%d %H:%i:%s') AS datentime, act
        FROM ActionsTable
        WHERE user_id = ?
        ORDER BY datentime DESC
    `;
    db.query(sql, [userId], (error, results) => {

        if (error) {
            console.error("Database error:", error.message);

            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true,
            actions: results
        });
    });

});
// Test database
app.get("/dbtest", (res) => {

    db.query("SELECT 1", (error) => {

        if (error) {
            console.error(error);

            return res.json({
                success: false
            });
        }

        res.json({
            success: true,
            message: "MySQL is working!"
        });
    });

});
app.get("/prices", (req, res) => {
    db.query("SELECT peanut_candy_100, peanut_candy_500 FROM Prices LIMIT 1", (error, results) => {
        if (error) {
            console.error("Database error while getting prices:", error.message);
            return res.json({ success: false });
        }
        if (!results.length) {
            return res.json({ success: false });
        }
        return res.json({
            success: true,
            peanut_candy_100: Number(results[0].peanut_candy_100),
            peanut_candy_500: Number(results[0].peanut_candy_500)
        });
    });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PNRecords API running on port", PORT);
});

