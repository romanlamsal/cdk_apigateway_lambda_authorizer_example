# Setup
* set key for terraform backend
* set locals in projectlocals.tf
* adjust route53 hosted zone NS and SOA entries
    * might be necessary to buy a domain via AWS and import the default hosted zone

# Open
* Redeployment of aws_api_gateway_deployment stil needs to be done manually
* Dependencies between api gateway resources is not fully modeled. Multiple applies might be necessary
