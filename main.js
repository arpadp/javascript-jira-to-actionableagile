//Some teams may use dev done status as end date, but people may push directly to done. This helps to have these stories closed as well.
const overrideDevDoneDateWithDevDateWhenDevDoneDateIsNull = true;

$(document).ready(function () {
	console.log("document loaded");
	runTests();

	$("#btnDownload").click(function () {

		var inputJsonLinkLocation = $("#inputJsonLinkLocation").val();
		var inputJson = $("#inputJson").val();
		var inputWorkflow = $("#inputWorkflow").val();
		var worklfowSteps = getWorkflowSteps(inputWorkflow);

		if (worklfowSteps == null) {
			alert("The workflow is not in the proper format!");
		}

		if (inputJsonLinkLocation != "") {
			exportCSVFileFromLink(inputJsonLinkLocation, worklfowSteps);

		} else {
			exportCSVFileFromtexInput(inputJson, worklfowSteps);
		}

	});
});

function exportCSVFileFromLink(inputJsonLinkLocation, worklfowSteps) {
	var request = new XMLHttpRequest();
	request.open("GET", inputJsonLinkLocation, false);
	request.send(null)
	if (isValidJson(request.responseText)) {
		var linkJsonObj = JSON.parse(request.responseText);
		var fromatedObj = formatJson(linkJsonObj, worklfowSteps);
		exportCSVFile(fromatedObj.issues, "Data");
	}
	else {
		alert("Invalid Json from link");
	}

}

function exportCSVFileFromtexInput(inputJson, worklfowSteps) {
	if (isValidJson(inputJson)) {
		var jsonObj = jQuery.parseJSON(inputJson);
		if (!isValidJiraJson(jsonObj)) {
			alert("Invalid Jira Json");
		}
		else {
			var fromatedObj = formatJson(jsonObj, worklfowSteps);
			exportCSVFile(fromatedObj.issues, "Data");
		}
	}
	else {
		alert("Invalid Json");
	}

}


function getWorkflowSteps(inputWorkflow) {

	if (inputWorkflow.includes(',')) {
		worklfowSteps = inputWorkflow.split(',');
		return worklfowSteps;
	}
	else {
		return null;
	}
}

function formatJson(jsonObj, worklfowSteps) {

	var fromatedObj = JSON.parse(getSkeletonJsonFormated());
	for (var i = 0; i < jsonObj.issues.length; i++) {
		var histories = jsonObj.issues[i].changelog.histories;

		var id = jsonObj.issues[i].key;
		var summary = removeCommas(jsonObj.issues[i].fields.summary);
		var type = removeCommas(jsonObj.issues[i].fields.issuetype.name);

		var workflowValues = [];
		for (var j = 0; j < worklfowSteps.length; j++) {
			workflowValues.push(getDateByStatus(histories, worklfowSteps[j]));
		}

		var itemToPush = getItemToPush(id, summary, workflowValues, type, histories);
		fromatedObj['issues'].push(itemToPush);

	}
	return fromatedObj;
}

function getSkeletonJsonFormated() {
	var skeletonJSON = '{"issues":[{"Id":"Id","Name":"Name", ';

	for (var i = 0; i < worklfowSteps.length; i++) {
		skeletonJSON = skeletonJSON + '"' + worklfowSteps[i] + '":"' + worklfowSteps[i] + '",';

	}

	skeletonJSON = skeletonJSON + '"Type":"Type" }]}';

	return skeletonJSON;
}

function getItemToPush(id, name, workflowStepsValue, type, histories) {
	//The order should be Id, Name, [Steps],Type to be accepted by actionableagile
	var item = {};
	item["Id"] = id;
	item["Name"] = name;

	for (var i = 0; i < worklfowSteps.length; i++) {

		if (!overrideDevDoneDateWithDevDateWhenDevDoneDateIsNull) {
			item[worklfowSteps[i]] = workflowStepsValue[i];
		} else {
			if (worklfowSteps[i] == "Dev Done") {
				var endDate = workflowStepsValue[i];
				if (endDate == "") {
					endDate = getDateByStatus(histories, "Waiting for Release");
				}
				if (endDate == "") {
					endDate = getDateByStatus(histories, "Done");
				}

				item[worklfowSteps[i]] = endDate;

			}
			else {
				item[worklfowSteps[i]] = workflowStepsValue[i];
			}
		}


	}

	item["Type"] = type;

	return item;
}



function removeCommas(str) {
	return str.replace(",", " ");
}

function getDateByStatus(histories, toStatus) {
	for (var i = 0; i < histories.length; i++) {
		if (histories[i].items[0].toString == toStatus) {
			return histories[i].created;
		}
	}
	return "";
}

function exportCSVFile(jsonObject, fileTitle) {

	var csv = ConvertToCSV(jsonObject);

	var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

	var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, exportedFilenmae);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", exportedFilenmae);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

function ConvertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}


function isValidJiraJson(jsonObj) {
	try {
		if (typeof jsonObj != 'undefined' && typeof jsonObj.issues != 'undefined' && typeof jsonObj.issues[0].key != 'undefined') {
			return true;
		}
		return false;
	}
	catch (error) {
		console.error();
		return false;
	}

}

function isValidJson(inputStr) {
	try {
		var jsonObj = jQuery.parseJSON(inputStr);
		if (typeof jsonObj != 'undefined') {
			return true;
		}
		return false;
	}
	catch (error) {
		console.error();
		return false;
	}
}

function runTests() {
	var result = true;
	if (!testOKGetWorkflowSteps()) {
		alert("getWorkflowStepsTestOk failed");
		result = false;
	}
	if (!testShouldFailGetWorkflowSteps()) {
		alert("getWorkflowStepsShouldFail failed");
		result = false;
	}
	if (!testOKIsValidJson()) {
		alert("isValidJsonTestOK failed");
		result = false;
	}
	if (!testShouldFailIsValidJiraJson()) {
		alert("testShouldFailIsValidJiraJson failed");
		result = false;
	}
	if (!testConvertToCSVOK()) {
		alert("testConvertToCSVOK failed");
		result = false;
	}
	if (!integrationTest()) {
		alert("integrationTest failed");
		result = false;
	}
	if (result) {
		console.log("All tests passed");
	}

}

function testOKGetWorkflowSteps() {
	var inputStr = "a,b"
	var result = getWorkflowSteps(inputStr);

	if (result.length == 2) {
		return true;
	}
	return false;
}

function testShouldFailGetWorkflowSteps() {
	var inputStr = "ab"
	var result = getWorkflowSteps(inputStr);

	if (result == null) {
		return true;
	}
	return false;

}

function testOKIsValidJson() {
	var jsonString = '{"menu": {"id": "file","value": "File","popup": {"menuitem": [{"value": "New", "onclick": "CreateNewDoc()"},{"value": "Open", "onclick": "OpenDoc()"},{"value":"Close", "onclick": "CloseDoc()"}]}}}';
	if (isValidJson(jsonString)) {
		return true;
	}
	return false;

}

function testShouldFailIsValidJiraJson() {
	var wrongLongJson = '{"menu": {"id": "file","value": "File","popup": {"menuitem": [{"value": "New", "onclick": "CreateNewDoc()"},{"value": "Open", "onclick": "OpenDoc()"},{"value":"Close", "onclick": "CloseDoc()"}]}}}';
	var wrongShortText = 'asdkjhsakdjhasdkj';
	var wrongNull = '';
	if (isValidJiraJson(wrongLongJson) == false && isValidJiraJson(wrongShortText) == false && isValidJiraJson(wrongNull) == false) {
		return true
	}
	return false;
}

function testConvertToCSVOK() {
	var okJson = '["Ford", "BMW", "Fiat"]';
	var stringCSV = ConvertToCSV(okJson);

	if (stringCSV != null && stringCSV.includes(',')) {
		return true;
	}

	return false;
}

function integrationTest() {

	try {

		var worklfowSteps = getWorkflowSteps("Analysis in progress,Waiting for Dev,Dev In Progress,Waiting for Code Review,Code Review In Progress,Dev Done");
		var jsonObj = jQuery.parseJSON(testJiraJson);
		var formatedObj = formatJson(jsonObj, worklfowSteps);
		var stringCSV = ConvertToCSV(formatedObj.issues);

		if (formatedObj.issues.length == 2 && stringCSV != null && stringCSV.includes(',') && stringCSV.startsWith('Id,Name')) {
			return true;
		}
		return false;
	} catch (error) {
		console.error();
		return false;
	}

}


const testJiraJson = `{"expand":"names,schema","startAt":0,"maxResults":1,"total":672,"issues":[{"expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations","id": "648115","self": "https://jira.corp.z.com/rest/api/latest/issue/648115","key": "HOP-2767","fields": {"customfield_16171": "","customfield_16050": 0,"customfield_14153": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/20874","value": "Full Report","id": "20874","disabled": false},"customfield_16453": "https://docs.google.com/spreadsheets/d/1dwO63yb7tVLVSK2I2iDsXwfNntPwBR5mzuxDBVi9fsk/edit#gid=0","customfield_16452": "https://docs.google.com/spreadsheets/d/1s6VHdbR59c7fpgNNL9c1pva6OQhMAf00Msn2K4Tc3ig/edit#gid=0","customfield_14151": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/20872","value": "No","id": "20872","disabled": false},"fixVersions": [],"resolution": null,"customfield_13103": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/18012","value": "N/A","id": "18012","disabled": false,"child": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/18013","value": "N/A","id": "18013","disabled": false}},"customfield_16217": null,"customfield_13106": "n/a","customfield_13105": "n/a","customfield_11953": null,"customfield_11954": null,"lastViewed": null,"customfield_16561": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/40733","value": "No","id": "40733","disabled": false},"customfield_11792": null,"customfield_11550": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/10310","value": "Functionality","id": "10310","disabled": false},"priority": {"self": "https://jira.corp.z.com/rest/api/2/priority/2","iconUrl": "https://jira.corp.z.com/images/icons/priorities/critical.svg","name": "Critical","id": "2"},"customfield_13059": "NA","labels": ["RAS_ER", "cbi_endpoint_swg", "cbi_guacamole"],"customfield_11787": null,"aggregatetimeoriginalestimate": null,"timeestimate": null,"versions": [],"issuelinks": [],"customfield_18061": null,"assignee": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"status": {"self": "https://jira.corp.z.com/rest/api/2/status/11836","description": "","iconUrl": "https://jira.corp.z.com/images/icons/statuses/generic.png","name": "Code Review In Progress","id": "11836","statusCategory": {"self": "https://jira.corp.z.com/rest/api/2/statuscategory/2","id": 2,"key": "new","colorName": "blue-gray","name": "To Do"}},"components": [],"customfield_18058": null,"customfield_18059": null,"customfield_16551": null,"customfield_18053": null,"customfield_10050": "9223372036854775807","customfield_12350": null,"customfield_18054": null,"customfield_18055": null,"customfield_11784": null,"customfield_16559": null,"customfield_11786": null,"customfield_16558": null,"customfield_16557": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/40329","value": "No","id": "40329","disabled": false},"archiveddate": null,"customfield_11776": null,"aggregatetimeestimate": null,"customfield_18050": null,"creator": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"customfield_17872": null,"subtasks": [],"customfield_15053": null,"customfield_17870": null,"customfield_11250": "2021-08-26T23:24:36.084-0700","customfield_17198": [],"customfield_15450": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/28887","value": "Concept - TDB on full PRD or ER Only","id": "28887","disabled": false},"customfield_11251": null,"customfield_17876": null,"customfield_13550": "1|i1tea7:","customfield_15852": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/31824","value": "To Be Sized","id": "31824","disabled": false},"customfield_17875": null,"reporter": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"customfield_17874": null,"customfield_15058": null,"customfield_17873": null,"aggregateprogress": {"progress": 0,"total": 0},"customfield_11772": null,"customfield_16669": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/41628","value": "To Be Determined","id": "41628","disabled": false},"customfield_17878": null,"customfield_17877": null,"progress": {"progress": 0,"total": 0},"votes": {"self": "https://jira.corp.z.com/rest/api/2/issue/HOP-2767/votes","votes": 0,"hasVoted": false},"worklog": {"startAt": 0,"maxResults": 20,"total": 0,"worklogs": []},"customfield_17193": null,"archivedby": null,"issuetype": {"self": "https://jira.corp.z.com/rest/api/2/issuetype/9","id": "9","description": "Created by Jira Software - do not edit or delete. Issue type for a user story.","iconUrl": "https://jira.corp.z.com/secure/viewavatar?size=xsmall&avatarId=12365&avatarType=issuetype","name": "Story","subtask": false,"avatarId": 12365},"customfield_16492": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39627","value": "No","id": "39627","disabled": false},"customfield_12051": [{"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"}, {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"}],"customfield_13140": "NA","customfield_16497": null,"customfield_17861": null,"customfield_16496": null,"customfield_17860": null,"timespent": null,"customfield_12052": "HOP-1227","customfield_14872": null,"customfield_17865": null,"customfield_13143": null,"project": {"self": "https://jira.corp.z.com/rest/api/2/project/13230","id": "13230","key": "HOP","name": "Appsulate","projectTypeKey": "software","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/projectavatar?pid=13230&avatarId=13054","24x24": "https://jira.corp.z.com/secure/projectavatar?size=small&pid=13230&avatarId=13054","16x16": "https://jira.corp.z.com/secure/projectavatar?size=xsmall&pid=13230&avatarId=13054","32x32": "https://jira.corp.z.com/secure/projectavatar?size=medium&pid=13230&avatarId=13054"}},"customfield_14353": null,"customfield_16499": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39677","value": "No","id": "39677","disabled": false},"customfield_10550": "9223372036854775807","customfield_13148": null,"customfield_17869": null,"aggregatetimespent": null,"customfield_17867": null,"customfield_17866": null,"customfield_14869": null,"customfield_14868": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/31986","value": "To Be Reviewed","id": "31986","disabled": false},"customfield_17859": null,"resolutiondate": "2021-05-19T15:50:37.464-0700","workratio": -1,"customfield_15150": null,"customfield_13092": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/15654","value": "DHL","id": "15654","disabled": false},"customfield_16085": 0.0,"customfield_17053": null,"customfield_16481": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39563","value": "No","id": "39563","disabled": false},"watches": {"self": "https://jira.corp.z.com/rest/api/2/issue/HOP-2767/watchers","watchCount": 2,"isWatching": false},"customfield_13093": "NA","customfield_13250": "2|hy6civ:9bh84i","customfield_17850": null,"customfield_13131": "n/a","created": "2021-05-19T15:50:37.486-0700","customfield_16087": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/36614","value": "Low","id": "36614","disabled": false},"customfield_15554": [{"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/29891","value": "None","id": "29891","disabled": false}],"customfield_15950": null,"customfield_13132": "n/a","customfield_15951": null,"customfield_17858": null,"customfield_13139": "NA","customfield_17855": null,"customfield_14859": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/23889","value": "No","id": "23889","disabled": false},"updated": "2021-09-07T00:00:48.060-0700","customfield_16471": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39202","value": "Unexecuted","id": "39202","disabled": false},"customfield_13081": null,"customfield_13120": ["NA"],"timeoriginalestimate": null,"customfield_12550": null,"customfield_13122": "NA","customfield_17205": null,"customfield_13121": ["NA"],"customfield_16753": null,"description": "Port UL&DL feature to Window implementation - replace Downloads tab with modal rendered on Guacamole Client. Requires new messages","customfield_10010": null,"customfield_16751": [{"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"}, {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"}, {"self": "https://jira.corp.z.com/rest/api/2/user?username=n","name": "n","key": "n","emailAddress": "n@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?avatarId=13070","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&avatarId=13070","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&avatarId=13070","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&avatarId=13070"},"displayName": "n","active": true,"timeZone": "America/Los_Angeles"}],"timetracking": {},"customfield_13119": "NA","attachment": [{"self": "https://jira.corp.z.com/rest/api/2/attachment/388180","id": "388180","filename": "00-tabs.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:05.144-0700","size": 358426,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/388180/00-tabs.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/388180/_thumb_388180.png"}, {"self": "https://jira.corp.z.com/rest/api/2/attachment/388181","id": "388181","filename": "01-banner.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:05.518-0700","size": 375510,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/388181/01-banner.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/388181/_thumb_388181.png"}, {"self": "https://jira.corp.z.com/rest/api/2/attachment/388182","id": "388182","filename": "02-download.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:05.605-0700","size": 375262,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/388182/02-download.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/388182/_thumb_388182.png"}, {"self": "https://jira.corp.z.com/rest/api/2/attachment/388183","id": "388183","filename": "03-upload.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:05.716-0700","size": 449661,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/388183/03-upload.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/388183/_thumb_388183.png"}, {"self": "https://jira.corp.z.com/rest/api/2/attachment/388184","id": "388184","filename": "04-logout.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:05.480-0700","size": 365872,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/388184/04-logout.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/388184/_thumb_388184.png"}, {"self": "https://jira.corp.z.com/rest/api/2/attachment/394328","id": "394328","filename": "cbi-client-stream.png","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-17T01:47:20.758-0700","size": 95725,"mimeType": "image/png","content": "https://jira.corp.z.com/secure/attachment/394328/cbi-client-stream.png","thumbnail": "https://jira.corp.z.com/secure/thumbnail/394328/_thumb_394328.png"}],"summary": "SWG UL&DL window impl.","customfield_13070": "Same as shipping address","customfield_15250": "","customfield_16183": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/37636","value": "No","id": "37636","disabled": false},"customfield_13071": "NA","customfield_13074": "n/a","customfield_16463": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39013","value": "Parallel","id": "39013","disabled": false},"customfield_13073": "n/a","customfield_15251": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/32042","value": "To Be Determined","id": "32042","disabled": false},"customfield_11450": ["com.atlassian.greenhopper.service.sprint.Sprint@17a418e7[id=846,rapidViewId=310,state=CLOSED,name=Team Lemon Sprint 33,startDate=2021-07-22T10:58:00.000-07:00,endDate=2021-08-05T10:58:00.000-07:00,completeDate=2021-08-05T03:06:34.589-07:00,activatedDate=2021-07-22T03:53:51.953-07:00,sequence=846,goal=Isolation bar and UL&DL feature (window),autoStartStop=false]", "com.atlassian.greenhopper.service.sprint.Sprint@562795b8[id=861,rapidViewId=310,state=CLOSED,name=Team Lemon Sprint 34,startDate=2021-08-05T03:25:00.000-07:00,endDate=2021-08-19T03:25:00.000-07:00,completeDate=2021-08-19T00:20:27.084-07:00,activatedDate=2021-08-05T03:25:13.514-07:00,sequence=861,goal=CBI Client integration (UL&DL),autoStartStop=false]", "com.atlassian.greenhopper.service.sprint.Sprint@246cb5de[id=878,rapidViewId=310,state=ACTIVE,name=Team Lemon Board,startDate=2021-08-19T04:30:00.000-07:00,endDate=2022-09-02T04:30:00.000-07:00,completeDate=<null>,activatedDate=2021-08-19T04:30:35.913-07:00,sequence=873,goal=<null>,autoStartStop=false]"],"customfield_16500": {"self": "https://jira.corp.z.com/rest/api/2/customFieldOption/39679","value": "No","id": "39679","disabled": false},"customfield_13077": "NA","customfield_17951": null,"customfield_10000": null,"customfield_13079": "NA","customfield_17950": null,"customfield_10003": null,"customfield_10004": null,"environment": null,"duedate": null,"comment": {"comments": [{"self": "https://jira.corp.z.com/rest/api/2/issue/648115/comment/1418239","id": "1418239","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"updateAuthor": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T12:32:56.197-0700","updated": "2021-08-17T01:48:18.908-0700"}, {"self": "https://jira.corp.z.com/rest/api/2/issue/648115/comment/1447874","id": "1447874","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"},"updateAuthor": {"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"},"created": "2021-08-26T23:24:36.084-0700","updated": "2021-08-26T23:24:36.084-0700"}, {"self": "https://jira.corp.z.com/rest/api/2/issue/648115/comment/1453345","id": "1453345","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"},"body": "created a DRAFT for adding the message to be sent to the guac-client + cleanup. [https: //github.com/gethopi/isolation-browser/pull/19]","updateAuthor": {"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=a&avatarId=15358","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=a&avatarId=15358","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=a&avatarId=15358","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=a&avatarId=15358"},"displayName": "a","active": true,"timeZone": "Asia/Kathmandu"},"created": "2021-09-01T04:58:58.054-0700","updated": "2021-09-01T04:58:58.054-0700"},{"self": "https://jira.corp.z.com/rest/api/2/issue/648115/comment/1458068","id": "1458068","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"updateAuthor": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-09-07T00:00:48.058-0700","updated": "2021-09-07T00:00:48.058-0700"}],"maxResults": 4,"total": 4,"startAt": 0}},"changelog": {"startAt": 0,"maxResults": 14,"total": 14,"histories": [{"id": "4182387","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=a","name": "a","key": "a","emailAddress": "a@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?avatarId=13079","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&avatarId=13079","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&avatarId=13079","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&avatarId=13079"},"displayName": "a","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-06-16T08:07:46.634-0700","items": [{"field": "Sprint","fieldtype": "custom","from": null,"fromString": null,"to": "806","toString": "Roadmap items"}]}, {"id": "4200442","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=n","name": "n","key": "n","emailAddress": "n@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?avatarId=13070","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&avatarId=13070","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&avatarId=13070","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&avatarId=13070"},"displayName": "n","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-06-22T07:28:22.328-0700","items": [{"field": "Sprint","fieldtype": "custom","from": "806","fromString": "Roadmap items","to": "811","toString": "Team Lemon Backlog"}]}, {"id": "4200457","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=n","name": "n","key": "n","emailAddress": "n@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?avatarId=13070","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&avatarId=13070","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&avatarId=13070","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&avatarId=13070"},"displayName": "n","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-06-22T07:28:25.498-0700","items": [{"field": "Rank (Obsolete)","fieldtype": "custom","from": "","fromString": "","to": "","toString": "Ranked higher"}]}, {"id": "4238044","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=n","name": "n","key": "n","emailAddress": "n@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?avatarId=13070","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&avatarId=13070","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&avatarId=13070","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&avatarId=13070"},"displayName": "n","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-07-02T02:09:42.299-0700","items": [{"field": "Rank (Obsolete)","fieldtype": "custom","from": "","fromString": "","to": "","toString": "Ranked higher"}]}, {"id": "4298662","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-07-21T02:01:45.449-0700","items": [{"field": "Sprint","fieldtype": "custom","from": "811","fromString": "Lemon Backlog (34 items)","to": "846","toString": "Team Lemon Sprint 33"}]}, {"id": "4352449","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T00:02:21.808-0700","items": [{"field": "status","fieldtype": "jira","from": "10025","fromString": "To Do","to": "11832","toString": "Analysis In Progress"}]}, {"id": "4355021","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-02T11:15:06.158-0700","items": [{"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "388184","toString": "04-logout.png"}, {"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "388183","toString": "03-upload.png"}, {"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "388182","toString": "02-download.png"}, {"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "388181","toString": "01-banner.png"}, {"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "388180","toString": "00-tabs.png"}]}, {"id": "4368290","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-05T03:06:34.781-0700","items": [{"field": "Sprint","fieldtype": "custom","from": "846","fromString": "Team Lemon Sprint 33","to": "846, 861","toString": "Team Lemon Sprint 33, Team Lemon Sprint 34"}]}, {"id": "4426933","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-17T01:47:21.207-0700","items": [{"field": "Attachment","fieldtype": "jira","from": null,"fromString": null,"to": "394328","toString": "cbi-client-stream.png"}]}, {"id": "4436438","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-19T00:16:23.771-0700","items": [{"field": "status","fieldtype": "jira","from": "11832","fromString": "Analysis In Progress","to": "11834","toString": "Dev In Progress"}]}, {"id": "4436442","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-19T00:20:27.369-0700","items": [{"field": "Sprint","fieldtype": "custom","from": "846, 861","fromString": "Team Lemon Sprint 33, Team Lemon Sprint 34","to": "846, 861, 878","toString": "Team Lemon Sprint 33, Team Lemon Sprint 34, Team Lemon Sprint 35"}]}, {"id": "4437013","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-19T03:27:22.047-0700","items": [{"field": "Rank (Obsolete)","fieldtype": "custom","from": "","fromString": "","to": "","toString": "Ranked higher"}]}, {"id": "4460002","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-08-25T00:11:19.030-0700","items": [{"field": "assignee","fieldtype": "jira","from": null,"fromString": null,"to": "c","toString": "c"}]}, {"id": "4513793","author": {"self": "https://jira.corp.z.com/rest/api/2/user?username=c","name": "c","key": "c","emailAddress": "c@z.com","avatarUrls": {"48x48": "https://jira.corp.z.com/secure/useravatar?ownerId=c&avatarId=16763","24x24": "https://jira.corp.z.com/secure/useravatar?size=small&ownerId=c&avatarId=16763","16x16": "https://jira.corp.z.com/secure/useravatar?size=xsmall&ownerId=c&avatarId=16763","32x32": "https://jira.corp.z.com/secure/useravatar?size=medium&ownerId=c&avatarId=16763"},"displayName": "c","active": true,"timeZone": "America/Los_Angeles"},"created": "2021-09-07T00:00:48.061-0700","items": [{"field": "status","fieldtype": "jira","from": "11834","fromString": "Dev In Progress","to": "11836","toString": "Code Review In Progress"}]}]}}]}`;
