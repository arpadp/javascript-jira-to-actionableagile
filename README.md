# javascript-jira-to-actionableagile
Simple javascript tool to convert jira data to actionableagile csv import format

Problem statement
I want to have a data driven approach on how teams work by using jira as the single point of truth and https://analytics.actionableagile.com to interpret the results. 
This tool is used to convert a json, from a jira rest api server, to a csv fomratted for analytics.

The tool works in three steps:
1. Setup the worklfow you want to use. The statuses have to match the exact jira text, and need to be separated by comma 
2. Query the jira server with an active session on a url like: https://jira.corp.your.instance.com/rest/api/latest/search?jql=filter=28623&expand=changelog&maxResults=100 Note that you can change the jql query with whatever data you are interested in analysing. *Very important* to have the &expand=changelog parameter to have the history of the jira items, so that the script can look up dates on diferent workflow statuses. 
3. Copy paste the json in the textarea. For large json files, the textarea breaks. So I've added a simple python server to be used to stream the large file. This is for extreame cases, the standard input works well for ~150 issues.
4. Convert to CSV. Look into the code and change the statuses to match the actual workflow.
