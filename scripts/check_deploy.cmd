@echo off
node scripts/monitor_deploy.js > deploy_monitor_output.txt 2>&1
type deploy_monitor_output.txt
