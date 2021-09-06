# javascript-jira-to-actionableagile
Simple javascript tool to convert jira data to actionableagile csv import format

This tool is used to convert from a json jira api server to a csv for https://analytics.actionableagile.com 

They it works is in three steps:
1. Query your jira server with an active session on a url like this: https://jira.corp.your.instance.com/rest/api/latest/search?jql=filter=28623&expand=changelog&maxResults=100 Note that you can change the jql query with whatever data you are interested in analysing. Very important to have the &expand=changelog parameter to have the history of the jira items, so that the script can look up dates on diferent statuses. 
2. Copy paste the json in the textarea
3. Convert to CSV. Note that one may want to change the code to mach their own statuses. 
