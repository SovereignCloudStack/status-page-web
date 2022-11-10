docker run --network host -d caddy sh -c '
cat > Caddyfile <<EOF
:5000

handle_path /api/* {
    reverse_proxy /* 127.0.0.1:4000
}
reverse_proxy /* 127.0.0.1:3000
EOF

exec caddy run'