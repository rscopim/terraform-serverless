output "zone_id" {
  value = data.aws_route53_zone.this.zone_id
}

output "name_servers" {
  value = data.aws_route53_zone.this.name_servers
}