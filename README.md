# javascript-jira-to-actionableagile
Simple javascript tool to convert jira data to actionableagile csv import format

Problem statement
I want to have a data driven approach on how teams work by using jira as the single point of truth and https://analytics.actionableagile.com to interpret the results. 
This tool is used to convert a json, from a jira rest api server, to a csv fomratted for analytics.

The tool works in three steps:
1. Query the jira server with an active session on a url like: https://jira.corp.your.instance.com/rest/api/latest/search?jql=filter=28623&expand=changelog&maxResults=100 Note that you can change the jql query with whatever data you are interested in analysing. *Very important* to have the &expand=changelog parameter to have the history of the jira items, so that the script can look up dates on diferent workflow statuses. 
2. Copy paste the json in the textarea
3. Convert to CSV. Look into the code and change the statuses to match the actual workflow.
