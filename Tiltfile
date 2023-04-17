config.set_enabled_resources([
  "messaging",
  # "inject-build",
  # "inject-serve",
  "webchat-test",
  "yarn-install",
])

webchat_port = 3543
inject_port = 8080
messaging_port = 3100

local_resource(
  name='yarn-install',
  cmd='yarn',
  labels=['scripts'],
)

local_resource(
  name="messaging",
  serve_cmd="yarn dev",
  links=[
    'http://127.0.0.1:%s/' % messaging_port,
  ],
  serve_env={
    'DEBUG': '*',
    'LOGGING_ENABLED': 'true',
    'DISABLE_LOGGING_TIMESTAMP': 'true',
    'SINGLE_LINE_LOGGING': 'true',
    'SKIP_LOAD_ENV': 'true',
    'SPINNED': 'false',
    'NO_LAZY_LOADING': 'false',
    'ADMIN_KEY': 'abc123',
    'ENABLE_EXPERIMENTAL_SOCKETS': 'true',
    'DATABASE_URL': 'postgres://messaging:messaging@localhost:54321/messaging',
  },
  readiness_probe=probe(tcp_socket=tcp_socket_action(port=messaging_port)),
  labels=["service"]
)

# local_resource(
#   name="inject-build",
#   serve_dir="packages/inject",
#   serve_cmd="yarn dev",
#   labels=["service"],
# )

# local_resource(
#   name="inject-serve",
#   serve_dir="packages/inject/dist",
#   serve_cmd="npx http-server",
#   readiness_probe=probe(tcp_socket=tcp_socket_action(port=inject_port)),
#   labels=["service"],
# )

# local_resource(
#   name="webchat",
#   serve_dir="packages/inject",
#   serve_cmd="npx live-server --no-browser --entry-file=example.html",
#   resource_deps=["inject-build"],
#   serve_env={"PORT": "%s" % webchat_port},
#   readiness_probe=probe(tcp_socket=tcp_socket_action(port=webchat_port)),
#   links=[
#     'http://127.0.0.1:%s' % webchat_port,
#   ],
#   labels=["service"],
# )

local_resource(
  name="webchat-test",
  serve_dir="packages/inject",
  serve_cmd="yarn serve",
  labels=["service"],
  resource_deps=['messaging']
)
