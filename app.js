//modules

var express =  require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//application initializer

var connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'hmss'
    }
);

//resposible for /root static items
//app.use('/',express.static('./views/Extra/Statics'));
app.use('/', express.static('./views/Extra/Statics'));

/******************************************Proyojonio functions :') *********/

function sql(sql) {
    connection.query(sql,function (err) {
        if(err)
        console.log('sql error from function');
    })
}

function qualifiInsert(tableName, data , qualId, id) {

    console.log(id);
    var sql = "INSERT INTO " + tableName +" VALUES (" + id +"," + qualId+",";

    for(var i = 0; i < data.length; i++)
    {

        if(Number(data[i]))
        {
            sql = sql + " "+data[i]+ returnsComma(i,data.length-1);
        }
        else
        {

            sql = sql + "'"+data[i]+"'" +returnsComma(i,data.length-1);
        }


    }
    sql = sql + ");";

    return sql;

}

function experInsert(tableName, data, id) {

    console.log(id);
    var sql = "INSERT INTO " + tableName +" VALUES (" + id +",";

    for(var i = 0; i < data.length; i++)
    {

        if(Number(data[i]))
        {
            sql = sql + " "+data[i]+ returnsComma(i,data.length-1);
        }
        else
        {

            sql = sql + "'"+data[i]+"'" +returnsComma(i,data.length-1);
        }


    }
    sql = sql + ");";

    return sql;

}

function getNextPrimaryKey(tableName,primaryKey,getNext) {

    connection.query('SELECT '+primaryKey+' FROM ' +tableName+' ORDER BY '+primaryKey+' DESC LIMIT 1',function (err,result) {
        if(err){
             console.log("error");
        }else{
            return getNext(null,Object.values(result[0])[0]+1);
        }
    });
}

function getWorkingId(tableName,primaryKey,data) {

    connection.query('SELECT '+primaryKey+' FROM ' +tableName+' ORDER BY '+primaryKey+' DESC LIMIT 1',function (err,result) {
        if(err){
            console.log("error");
        }else{
            data.working=Object.values(result[0])[0];
        }
    });
}


function returnsComma(a,b) {
    if(a==b)
        return "";
    else
        return",";
}

function sqlInsert(tableName,data) {

    console.log(data);
    data = Object.values(data);

        var sql = "INSERT INTO " + tableName +" VALUES (";

        for(var i = 0; i < data.length; i++)
        {

            data[i] = String(data[i]);
            if(Number(data[i]))
            {
                sql = sql + " "+data[i]+ returnsComma(i,data.length-1);
            }
            else
            {

                sql = sql + "\""+data[i]+"\"" +returnsComma(i,data.length-1);
            }


        }

        sql = sql + ");";

    return sql;

}

function sqlInsertArray(tableName,data) {

    var sql = "INSERT INTO " + tableName +" VALUES (";

    for(var i = 0; i < data.length; i++)
    {

        data[i] = String(data[i]);
        if(Number(data[i]))
        {
            sql = sql + " "+data[i]+ returnsComma(i,data.length-1);
        }
        else
        {

            sql = sql + "\""+data[i]+"\"" +returnsComma(i,data.length-1);
        }


    }

    sql = sql + ", null );";

    return sql;

}

function callProcedure(pros,data) {

    console.log(data);
    data = Object.values(data);

    var sql = "CALL " + pros +" (";

    for(var i = 0; i < data.length; i++)
    {


        if(Number(data[i]))
        {
            sql = sql + " "+data[i]+ returnsComma(i,data.length-1);
        }
        else
        {

            sql = sql + "'"+data[i]+"'" +returnsComma(i,data.length-1);
        }


    }

    sql = sql + ");";

    return sql;

}

/***************************************?important vars*********/

var a={
    count:0,
    title1:["Serial No.","Degree","Board","Year","Division/CGPA","Position"],
    title2:["Serial NO","Job Title","From","To","Organization"],
    degree:["SSC","HSC","MBBS"],
    working:null
};

var b={
    count:0,
    title1:["Serial No.","Degree","Board","Year","Division/CGPA","Position"],
    title2:["Serial NO","Job Title","From","To","Organization"],
    degree:["SSC","HSC","BSC"],
    working:null
};

var bill = {
    mode:0,
    doctorBill:null,
    medicineBill: null,
    bedBill: null,
    depositedAmount: null,
    totalBill:null
};

/**********************************ROUTES******************************************/
//index




app.get('/',function (req,res) {
   res.render('index');
});

//doctors
app.get('/doctors/',function (req,res) {
    res.render('./Doctors/view');
});



app.get('/doctors/new',function (req,res) {
    res.render('./Doctors/new',{title1: a['title1'], title2: a['title2'], degree: a['degree'], pid: "1", count: a['count']});

});

app.post('/doctors/new',function (req,res) {

    //console.log("submit button clicked "+a['count']+" times");
    //console.log(req.body);
    switch(a['count']){
        case 0:
            //getWorkingId('Doctors','doctorId ',a);
            connection.query(callProcedure("doctorIn",req.body),function (err,res) {
                if(err)
                {
                    console.log('doctor procedure sql error');
                }
            });
            a['count']++;
            getWorkingId('Doctors','doctorId ',a);
            res.redirect('/doctors/new');
            break;
        case 1:
            console.log(req.body);
            console.log('working ID ;;; ' + a['working']);

            sql(qualifiInsert('doc_qualifi',req.body['SSC'],'101', a['working']));
            sql(qualifiInsert('doc_qualifi',req.body['HSC'],'102', a['working']));
            sql(qualifiInsert('doc_qualifi',req.body['MBBS'],'103', a['working']));

            a['count']++;
            res.redirect('/doctors/new');
            break;
        case 2:

           Object.keys(req.body).forEach(function (t) {
              sql(experInsert('doc_exper',req.body[t], a['working']));
           });
            a['count'] = 0;
            a['working'] = null;
            res.redirect('/doctors/');
            break;
        default:
            res.redirect('/doctors/');

            break;
    }
});




//medicines
app.get('/medicines/new',function (req,res) {
    getNextPrimaryKey("Medicines","medicineId",function(err,result){
        console.log("Outside "+result);
        res.render('./Medicines/new',{medC:result});
    });
});

app.get('/medicines/',function (req,res) {
    //res.render('./Medicines/view');
    connection.query("SELECT * FROM Medicines",function(err,result){
        if(err){
            console.log("medicine data error");
        }else{
            var a=Object.values(result);
            res.render("./Medicines/view", {data:a} );
        }
    });
});

app.post('/medicines',function (req,res) {

    //console.log(sqlInsert("Medicines",req.body));
    connection.query(sqlInsert("Medicines",req.body));
    res.redirect('/medicines');

});





//nurse new
app.get('/nurses/',function (req,res) {
    res.render('./Nurses/view');
});



app.get('/nurses/new',function (req,res) {
    res.render('./Nurses/new',{title1: b['title1'], title2: b['title2'], degree: b['degree'], pid: "1", count: b['count']});

});

app.post('/nurses/new',function (req,res) {

    //console.log("submit button clicked "+a['count']+" times");
    //console.log(req.body);
    switch(b['count']){
        case 0:
            //getWorkingId('Nurses','nurseId',b);
            connection.query(callProcedure("nurseIn",req.body),function (err,res) {
                if(err)
                {
                    console.log('nurse procedure sql error');
                }
            });
            b['count']++;
            getWorkingId('Nurses','nurseId ',b);
            res.redirect('/nurses/new');
            break;
        case 1:
            console.log(req.body);
            console.log('working ID ;;; ' + b['working']);

            sql(qualifiInsert('nurse_qualifi',req.body['SSC'],'101', b['working']));
            sql(qualifiInsert('nurse_qualifi',req.body['HSC'],'102', b['working']));
            sql(qualifiInsert('nurse_qualifi',req.body['BSC'],'104', b['working']));

            b['count']++;
            res.redirect('/nurses/new');
            break;
        case 2:

            Object.keys(req.body).forEach(function (t) {
                sql(experInsert('nurse_exper',req.body[t], b['working']));
            });
            b['count'] = 0;
            b['working'] = null;
            res.redirect('nurses');
            break;
        default:
            res.redirect('/nurses/');

            break;
    }
});


//nurses old
//
// app.get('/nurses/',function (req,res) {
//     res.render("./Nurses/view");
// });
//
// app.get('/nurses/new',function (req,res) {
//     res.render('./Nurses/new',{title1: b['title1'], title2: b['title2'], degree: b['degree'], pid: "1", count: b['count']});
//     b['count']++;
// });
//
// app.post('/nurses/new',function (req,res) {
//     console.log(req.body);
//     if(b['count']<3) {
//         res.redirect('/nurses/new');
//     }else{
//         res.redirect('/nurses/');
//         b['count']=0;
//     }
// });


//wards
app.get('/wards',function (req,res) {
    res.render('./Wards/view');
});

app.get('/wards/new',function (req,res) {
    res.render('./Wards/view');
});

app.post('/wards',function (req,res) {

});


//patients



app.get('/patients/bill',function (req, res) {

    res.render('./Patients/bill', {bill:bill});
});

app.post('/patients/bill',function (req, res) {
    console.log(req.body['patientId']);
    bill['mode'] = 1;

    connection.query("SELECT medicineName, medicineAdviced.quantity, unitePrice, medicineAdviced.quantity*unitePrice as 'total' FROM Advices, medicineAdviced, Medicines \n" +
        "WHERE medicineAdviced.adviceId = Advices.AdviceId AND medicineAdviced.medicineId=Medicines.medicineId AND Advices.patientId = "+ req.body['patientId'],function (err,result) {
        if(!err)
        {
            console.log('medicineBill' + result);
            bill['medicineBill'] = result;
        }//doctor bill
        connection.query("SELECT Doctors.doctorId, Doctors.fName, adviceId, visitFee FROM Doctors, Advices Where Advices.patientId = "+req.body['patientId']+" and Advices.doctorId = Doctors.doctorId",function (err,result) {
            if(!err)
            {
                bill['doctorBill'] = result;

                connection.query("select beds.bedId, bedRent from beds , Admitted\n" +
                    "where beds.bedId = Admitted.bedId and Admitted.patientId = "+ req.body['patientId'] ,function (err, result) {
                    if(!err)
                    {
                        bill['bedBill'] = result;

                        connection.query("select amountDeposite from patients where patientId = "+req.body['patientId'],function (err,result) {
                            if(!err){
                                bill['depositedAmount'] = Object.values(result[0])[0];

                                sql(callProcedure('updateTotalBill',req.body));

                                connection.query('select totalBill from Bills where patientId ='+req.body['patientId'],function (err,result) {
                                    bill['totalBill'] = Object.values(result[0])[0];
                                    console.log(bill);
                                    res.render('./Patients/bill',{bill:bill});
                                    bill['mode'] = 0;
                                    bill['bedBill'] = null;
                                    bill['doctorBill'] = null;
                                    bill['medicineBill'] = null;
                                    bill['depositedAmount'] = null;
                                    bill['totalBill'] =null;

                                });
                            }

                        });

                    }

                });


            }
        });
    });

});















//investigation ekhane post korbe

app.post('/patients/',function (req,res) {

   sql( sqlInsert('Investigations',req.body));
    res.redirect('/');
});

//merge after this

app.get('/patients/new',function (req,res) {

    res.render('./Patients/new');
});

app.get('/patients/prescription',function (req,res) {

    res.render('./Patients/prescriptionfor');
});

app.get('/patients/investigation',function (req,res) {

    res.render('./Patients/investigation');
});

app.get('/patients/pending',function (req, res) {

    connection.query("select patientId 'Patient ID', dateOfAdmission AS 'Admission Date' , CONCAT(fName, ' ',mName,' ', lName) as Name, dateOfBirth as 'Birth Date'\n" +
        "from  patients \n" +
        "where \n" +
        "patientId not in (select patientId from investigations);",function (err,result) {
        if(!err)
        {
            res.render('./Patients/pending',{result:result});
        }
    });

});



app.post('/patients/new',function (req,res) {
    //console.log(callProcedure('patientIn',req.body));
    var usersRows = [];
    connection.query(callProcedure('patientIn',req.body));
    /*connection.query(callProcedure('patientIn',req.body),function (err) {
        if(!err){
            connection.query("Select * From Patients ORDER BY  patientId DESC LIMIT 1",function (err,result) {
                if(!err){
                    usersRows = JSON.parse(JSON.stringify(result));
                    console.log(usersRows);
                    res.render('./patients/view',{userRows:usersRows});
                }else{
                    console.log('Error while performing view.' + err);
                }
            });

        }else{
            console.log('Error while performing procedure.' + err);
        }

    });*/
    connection.query("select a.patientId as 'Patient ID', a.dateOfAdmission as 'Admission Date', CONCAT(a.fName, ' ', a.mName, ' ',a.lName) as 'Name', a.dateOfBirth as 'Birth Date',\n" +
        "c.mob1 as 'Mobile (1)', c.mob2 as 'Mobile (2)', c.email as 'E-mail', CONCAT(pr.street, ' ', pr.streetName, ' ', pr.area, ' ',pr.thana,' ', pr.district)  as 'Present Address',CONCAT(pe.street, ' ', pe.streetName, ' ', pe.area, ' ',pe.thana,' ', pe.district)  as 'Permenent Address', a.profession as 'Professional', a.amountDeposite as 'Diposited Amount', a.wardId as 'Word No', ad.bedID as 'Bed No', a.depositorName as 'Depositor Name'\n" +
        "from patients a, contacts c, addresses pr, addresses pe , admitted ad\n" +
        "where a.contactId = c.contactId and a.presAddress = pr.addressId and a.permAddress = pe.addressId and ad.patientId = a.patientId and a.patientId = (SELECT patientId FROM Patients ORDER BY patientId DESC LIMIT 1)\n" +
        "\n",function (err,result) {
        if(!err){
            //usersRows = JSON.parse(JSON.stringify(result));
            res.render('./patients/view',{userRows:result[0]});
        }else{
            console.log('Error while performing view.' + err);
        }
    });

});

//ekhan theke
app.post('/patients/investigation',function (req,res) {

    connection.query("select a.patientId as 'Patient ID', a.dateOfAdmission as 'Admission Date', CONCAT(a.fName, ' ', a.mName, ' ',a.lName) as 'Name', a.dateOfBirth as 'Birth Date',\n" +
        "c.mob1 as 'Mobile (1)', c.mob2 as 'Mobile (2)', c.email as 'E-mail', CONCAT(pr.street, ' ', pr.streetName, ' ', pr.area, ' ',pr.thana,' ', pr.district)  as 'Present Address',CONCAT(pe.street, ' ', pe.streetName, ' ', pe.area, ' ',pe.thana,' ', pe.district)  as 'Permenent Address', a.profession as 'Professional', a.amountDeposite as 'Diposited Amount', a.wardId as 'Word No', ad.bedID as 'Bed No', a.depositorName as 'Depositor Name'\n" +
        "from patients a, contacts c, addresses pr, addresses pe , admitted ad\n" +
        "where a.contactId = c.contactId and a.presAddress = pr.addressId and a.permAddress = pe.addressId and ad.patientId = a.patientId and a.patientId = "+req.body['patientId']+ " ;",
        function (err,result) {
        if(!err){
            //usersRows = JSON.parse(JSON.stringify(result));
            res.render('./Patients/investigation',{userRows:result[0]});
        }else{
            console.log('Error while performing view.' + err);
        }
    });


});




//egula likha merger korar shomy dekha lagbe



app.post('/patients/prescription',function (req,res) {


    connection.query("select a.patientId as 'Patient ID', a.dateOfAdmission as 'Admission Date', CONCAT(a.fName, ' ', a.mName, ' ',a.lName) as 'Name', a.dateOfBirth as 'Birth Date',\n" +
        "c.mob1 as 'Mobile (1)', c.mob2 as 'Mobile (2)', c.email as 'E-mail', CONCAT(pr.street, ' ', pr.streetName, ' ', pr.area, ' ',pr.thana,' ', pr.district)  as 'Present Address',CONCAT(pe.street, ' ', pe.streetName, ' ', pe.area, ' ',pe.thana,' ', pe.district)  as 'Permenent Address', a.profession as 'Professional', a.amountDeposite as 'Diposited Amount', a.wardId as 'Word No', ad.bedID as 'Bed No', a.depositorName as 'Depositor Name'\n" +
        "from patients a, contacts c, addresses pr, addresses pe , admitted ad\n" +
        "where a.contactId = c.contactId and a.presAddress = pr.addressId and a.permAddress = pe.addressId and ad.patientId = a.patientId and a.patientId = " +req.body['patientId'],
        function (err,result) {
            if (!err) {

                sql('insert into Advices values (null, '+req.body['doctorId']+","+req.body['patientId']+");");

                connection.query("SELECT AdviceId FROM Advices ORDER BY AdviceId DESC LIMIT 1",function (err, result2) {

                    var adviceId = Object.values(result2[0])[0];
                    result[0]["adviceId"] = adviceId;
                    console.log(result[0]);
                    res.render('./Patients/prescription', {userRows: result[0]});

                });





            } else {
                console.log('Error while performing view.' + err);
            }
        }
    );
});

app.post('/patients/pres',function (req,res) {

    Object.keys(req.body).forEach(function (t) {
        console.log(t);
        if(String(t)[0]==='a') {
            sql(sqlInsertArray('medicineAdviced', req.body[t]));
        }
        else
        {
            sql(sqlInsertArray('testAdviced', req.body[t]));
        }
    });
});





//signup
app.get('/signup',function (req, res) {

    var usersRows = [];
    connection.query('Select * From WHO', function(err, rows,field) {
        if (!err) {
            usersRows = JSON.parse(JSON.stringify(rows));
            //console.log(usersRows);
            res.render('./User/signup',{userRows:usersRows});
        }
        else {
            console.log('Error while performing Query.' + err);
        }
    });
});

app.post('/signup',function (req,res) {
    var sql=sqlInsert("Users",req.body)
    console.log(sql);

    connection.query(sql,function (err) {
        if (!err) {
            console.log("Insertion Successful");
        }
        else {
            console.log('Error while performing Query.' + err);
        }
    });
    res.redirect('/');
});


//login
app.get('/login',function (req,res) {
    res.render('./User/login');
});

app.post('/login',function (req,res) {

    //console.log(req.body['username'],req.body['password']);
    //var id='Select id From Users Where user like "'+req.body['username']+'" and pass like "'+req.body['password']+'"';
    var type='Select type From Users,WHO Where Users.id=WHO.id AND user like "'+req.body['username']+'" and pass like "'+req.body['password']+'"';
    //console.log(type);


    var usersRows = [];
    connection.query(type,function (err,result) {
        if (!err) {
            if(result.length==0)
            {
                res.render('error',{data:"Incorrect Login Name or Password"});
            }
            usersRows = JSON.parse(JSON.stringify(result));
            //console.log(usersRows[0]["type"]);

            res.render('./User/panel',{type:usersRows});
        }
        else {
            console.log("error finding user");
        }
    });
    //res.render('./User/panel');
});


//panel

app.get('/user',function (req,res) {

    //res.render('./User/panel',{type:1})
    res.render('./User/panel');

});


app.get('*', function(req, res){
    res.render('error',{data:"The page you're looking for is not found!!"});
});

app.listen(3000,function () {
    console.log('server started');
});



