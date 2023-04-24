config.set_enabled_resources([
  "messaging",
  "inject-build",
  "inject-serve",
  "webchat",
])

webchat_port = 3543
inject_port = 8080
messaging_port = 3100

local_resource(
  name="messaging",
  serve_cmd="yarn dev",
  links=[
    'http://127.0.0.1:%s/' % messaging_port,
  ],
  readiness_probe=probe(tcp_socket=tcp_socket_action(port=messaging_port)),
  labels=["service"]
)

local_resource(
  name="inject-build",
  serve_dir="packages/inject",
  serve_cmd="yarn dev",
  labels=["service"],
)

local_resource(
  name="inject-serve",
  serve_dir="packages/inject/dist",
  serve_cmd="npx http-server",
  readiness_probe=probe(tcp_socket=tcp_socket_action(port=inject_port)),
  labels=["service"],
)

local_resource(
  name="webchat",
  serve_dir="packages/inject",
  serve_cmd="yarn serve",
  labels=["service"],
)
