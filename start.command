#!/usr/bin/env bash
cd "$(dirname "$0")"
(sleep 1; open http://127.0.0.1:8000) &
python3 server.py
