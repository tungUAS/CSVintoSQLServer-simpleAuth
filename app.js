'use strict';
var express = require("express");
var app = express();
var http = require("http").createServer(app);
const sql = require('mssql');
const fileUpload = require("express-fileupload");
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
let alert = require('alert');
const bcrypt = require("bcryptjs")
const storage = require('node-sessionstorage')
require('dotenv').config({ path: './app.env' })


const config = {

    database: process.env.database,

    password: process.env.password,

    port: 1433,

    server: process.env.server,

    user: process.env.user,
    
    driver: 'msnodesqlv8',

    trustServerCertificate: true,

    synchronize: true,
    
  };

app.use(express.static('views'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

storage.setItem('auth', 'false');

http.listen(4000, function () {
    app.get("/", function (request, result) { 
        result.sendFile(path.join(__dirname + '/views/loginpage/login.html')); 
    });
});

app.get("/index", function (request, result) {
    if(storage.getItem('auth')==='true'){
        result.sendFile(path.join(__dirname + '/views/mainpage/index.html'));  
    }else{
        result.sendFile(path.join(__dirname + '/views/loginpage/login.html')); 
    } 
});


app.get("/registration", function (request, result) {
    result.sendFile(path.join(__dirname + '/views/registrationpage/registration.html'));  
});

app.get("/back", function (request, result) {
    result.sendFile(path.join(__dirname + '/views/loginpage/login.html'));  
});

app.post('/authRegistration',async function(request, response) {
    var username = request.body.username;
    var userpassword = request.body.password;
    if (username ) {
        if( await authRegistrationQuery(username)===true){
            alert("User name already taken");
            response.redirect('/registration');
        }else {
            await insertNewUser(username,userpassword);
            alert('Succesful');
            response.redirect('/');
            }
    } else {
        alert('Please correct the fields!');
    }
}); 

app.post('/auth',async function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    let hashedPassword = await takeHashedPassword(password);

    if( await authQuery(username) && hashedPassword){
        storage.setItem('auth', 'true'); 
        response.redirect('/index');
    }else {
        alert('Wrong user or password');
        response.redirect('/');
    }

}); 

app.post('/bulkSQL',async (req,res) => {
    truncateQuery();
    try{
        var buff = Buffer.from(req.files.file.data);
        const data = buff.toString()
        .split('\n') // split string to lines
        .map(e => e.trim()) // remove white spaces for each line
        .map(e => e.split(',').map(e => e.trim())); 

        if(data.length<10000){
            //delay(data,1,data.length,config);
            await bulk_sql_async(data.slice(1,data.length),config);
        }else{
            for(let i=1;i<data.length;i=i+10000){
                let y = i+10000;
                if(y>data.length){
                    y = data.length-1;
                }
                //delay(data,i,y,config);
                await bulk_sql_async(data.slice(i,y),config);
            }   
        }
            
        alert('Success');
        res.redirect('/index');
    }
    catch(error){
        alert("Wrong file type");
        res.redirect('/index');
    }
});


async function truncateQuery() {
    try {
      let pool = await sql.connect(config);
      let res = await pool.request().query("truncate table [paoloLog].[dbo].[my_users_test_250k]");
      return res.recordsets;
    } catch (error) {
      console.log(" mathus-error :" + error);
    }
  }


async function takeHashedPassword(userName){
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query("Select userPassword from [paoloLog].[dbo].[users_test] where userName = '"+userName+"' " );

        return res.recordset[0].userPassword;
      } catch (error) {
        console.log(" mathus-error :" + error);
      }
}

async function authRegistrationQuery(userName){
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query("Select * from [paoloLog].[dbo].[users_test] where userName = '"+userName+"' " );
        if(res.recordsets[0].length === 0)
            return false;
        else
            return true;
      } catch (error) {
        console.log(" mathus-error :" + error);
      }
}

async function insertNewUser(userName,userPassword){
    try {
        userPassword=bcrypt.hashSync(userPassword, 10);
        let pool = await sql.connect(config);
        let res = await pool.request().query("Insert into [paoloLog].[dbo].[users_test] values('"+userName+"','"+userPassword+"')  " );
      } catch (error) {
        console.log(" mathus-error :" + error);
      }
}



async function authQuery(userName){
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query("Select * from [paoloLog].[dbo].[users_test] where userName = '"+userName+"' " );
        if(res.recordsets[0].length === 0)
            return false;
        else
            return true;
      } catch (error) {
        console.log(" mathus-error :" + error);
      }
}




 async function bulk_sql_async(data,config) {
    try{
        let pool = await sql.connect(config);
        const table = new sql.Table('my_users_test_250k');
        table.create = true;
        
        table.columns.add('name', sql.VarChar(128), { nullable: false });
        table.columns.add('name1', sql.VarChar(128), { nullable: false });
        table.columns.add('name2', sql.VarChar(128), { nullable: false });
        table.columns.add('name3', sql.VarChar(128), { nullable: false });
        table.columns.add('name4', sql.VarChar(128), { nullable: false });
        table.columns.add('name5', sql.VarChar(128), { nullable: false });
        table.columns.add('name6', sql.VarChar(128), { nullable: false });
        table.columns.add('name7', sql.VarChar(128), { nullable: false });
        table.columns.add('name8', sql.VarChar(128), { nullable: false });
        table.columns.add('name9', sql.VarChar(128), { nullable: false });
        table.columns.add('name10', sql.VarChar(128), { nullable: false });
        table.columns.add('name11', sql.VarChar(128), { nullable: false });
        // add here rows to insert into the table
        for(let i = 0;i<data.length;i++){
            table.rows.add(data[i].toString().split(';')[0],
            data[i].toString().split(';')[1],
            data[i].toString().split(';')[2],
            data[i].toString().split(';')[3],
            data[i].toString().split(';')[4],
            data[i].toString().split(';')[5],
            data[i].toString().split(';')[6],
            data[i].toString().split(';')[7],
            data[i].toString().split(';')[8],
            data[i].toString().split(';')[9],
            data[i].toString().split(';')[10],
            data[i].toString().split(';')[11]); 
        }
        
        const request = new sql.Request();
        
        console.log('inserted');
        return request.bulk(table);
    
    } catch (error) {
        console.log(" mathus-error :" + error);
      }
}  


  
console.log("Running on port 4000");