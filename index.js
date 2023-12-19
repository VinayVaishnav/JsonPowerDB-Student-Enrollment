function validateAndGetFormData() {
    var rollNoVar = $("#rollNo").val();
    if (rollNoVar === "") {
        alert("Roll No. is a required field");
        $("#rollNo").focus();
        return "";
    }

    var fullNameVar = $("#fullName").val();
    if (fullNameVar === "") {
        alert("Full Name is a required field");
        $("#fullName").focus();
        return "";
    }

    var classVar = $("#class").val();
    if (classVar === "") {
        alert("Class is a required field");
        $("#class").focus();
        return "";
    }

    var birthDateVar = $("#birthDate").val();
    if (birthDateVar === "") {
        alert("Birth Date is a required field");
        $("#birthDate").focus();
        return "";
    }

    var addressVar = $("#address").val();
    if (addressVar === "") {
        alert("Address is a required field");
        $("#address").focus();
        return "";
    }

    var enrollmentDateVar = $("#enrollmentDate").val();
    if (enrollmentDateVar === "") {
        alert("Enrollment Date is a required field");
        $("#enrollmentDate").focus();
        return "";
    }

    var jsonStrObj = {
        rollNo: rollNoVar,
        fullName: fullNameVar,
        class: classVar,
        birthDate: birthDateVar,
        address: addressVar,
        enrollmentDate: enrollmentDateVar
    };

    return JSON.stringify(jsonStrObj);
}

function resetForm() {
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const resetbtn = document.getElementById('resetBtn');

    saveBtn.disabled = false;
    updateBtn.disabled = true;
    resetbtn.disabled=false;

    document.getElementById('rollNo').value = '';
    document.getElementById('fullName').value = '';
    document.getElementById('class').value = '';
    document.getElementById('birthDate').value = '';
    document.getElementById('address').value = '';
    document.getElementById('enrollmentDate').value = '';
}

function createPUTRequest(connToken, jsonObj, dbName, relName) {
    var putRequest = "{\n" +
        "\"token\" : \"" + connToken + "\",\n" +
        "\"dbName\": \"" + dbName + "\",\n" +
        "\"cmd\" : \"PUT\",\n" +
        "\"rel\" : \"" + relName + "\",\n" +
        "\"jsonStr\": \n" + jsonObj + "\n" +
        "}";
    return putRequest;
}

function executeCommand(reqString, dbBaseUrl, apiEndPointUrl) {
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj;
    $.post(url, reqString, function (result) {
        jsonObj = JSON.parse(result);
    }).fail(function (result) {
        var dataJsonObj = result.responseText;
        jsonObj = JSON.parse(dataJsonObj);
    });
    return jsonObj;
}

function saveData() {
    var jsonStr = validateAndGetFormData();
    if (jsonStr === "") {
        return;
    }

    var putReqStr = createPUTRequest("90931967|-31949300549385016|90960459",
        jsonStr, "Student", "Student-Rel");

    console.log(putReqStr);

    $.ajaxSetup({ async: false });

    var resultObj = executeCommand(putReqStr,
        "http://api.login2explore.com:5577", "/api/iml");

    $.ajaxSetup({ async: true });

    console.log(resultObj);

    resetForm();
}

function checkStudentExistence() {
    const rollNo = document.getElementById('rollNo').value;

    // Pass a callback to checkIfStudentExists
    checkIfStudentExists(rollNo, function(studentExists) {
        const saveBtn = document.getElementById('saveBtn');
        const updateBtn = document.getElementById('updateBtn');

        console.log(studentExists);

        if (studentExists) {
            saveBtn.disabled = true;
            updateBtn.disabled = false;
        } else {
            resetForm();
            document.getElementById('rollNo').value=rollNo;
            saveBtn.disabled = false;
            updateBtn.disabled = true;
        }
    });
}

function executeGetCommand(reqString, dbBaseUrl, apiEndPointUrl, callback) {
    var url = dbBaseUrl + apiEndPointUrl;

    $.post(url, reqString, function (result) {
        var jsonObj = JSON.parse(result);
        callback(jsonObj);
    })
    .fail(function (error) {
        console.error('Error:', error);
        callback({});
    });
}

function checkIfStudentExists(rollNo, callback) {
    const filterObj = {
        "rollNo": rollNo
    };

    const getRequest = {
        "token": "90931967|-31949300549385016|90960459",
        "cmd": "GET",
        "dbName": "Student",
        "rel": "Student-Rel",
        "jsonStr": filterObj
    };

    const getReqStr = JSON.stringify(getRequest);

    executeGetCommand(getReqStr, "http://api.login2explore.com:5577", "/api/irl", function(result) {
        if (result && result.status === 200 && result.data) {
            const studentData = JSON.parse(result.data);
            if (studentData && studentData.rollNo) {
                fillFormWithStudentData(studentData);
                callback(true);  
            } else {
                console.log("Student data not found");
                callback(false);
            }
        } else {
            console.log("Error or invalid response status");
            callback(false);
        }
    });
}

function fillFormWithStudentData(studentData) {
    document.getElementById('fullName').value = studentData.fullName;
    document.getElementById('class').value = studentData.class;
    document.getElementById('birthDate').value = studentData.birthDate;
    document.getElementById('address').value = studentData.address;
    document.getElementById('enrollmentDate').value = studentData.enrollmentDate;
    document.getElementById('saveBtn').disabled=false
    document.getElementById('updateBtn').disabled=true
}

function updateData() {
    var jsonStr = validateAndGetFormData();
    if (jsonStr === "") {
        return;
    }

    console.log(jsonStr)
    var updateReqStr = createUpdateRequest("90931967|-31949300549385016|90960459",
        jsonStr, "Student", "Student-Rel");

    console.log(updateReqStr);

    executeUpdateCommand(updateReqStr,
        "http://api.login2explore.com:5577", "/api/iml/set",
        function(resultObj) {
            console.log(resultObj);
            document.getElementById('saveBtn').disabled=false
            document.getElementById('updateBtn').disabled=true
            
            resetForm();
        }
    );
}


function createUpdateRequest(connToken, jsonObj, dbName, relName) {
    var updateRequest = {
        "token": connToken,
        "cmd": "SET",
        "dbName": dbName,
        "rel": relName,
        "type": "UPDATE",
        "primaryKey": "rollNo", 
        "jsonStr": JSON.parse(jsonObj) 
    };

    return JSON.stringify(updateRequest);
}

function executeUpdateCommand(reqString, dbBaseUrl, apiEndPointUrl, callback) {
    var url = dbBaseUrl + apiEndPointUrl;

    $.post(url, reqString, function (result) {
        var jsonObj = JSON.parse(result);
        callback(jsonObj);
    })
    .fail(function (error) {
        console.error('Error:', error);
        callback({});
    });
}

