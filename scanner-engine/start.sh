#!/usr/bin/env bash
# Start script for Render.com

uvicorn main:app --host 0.0.0.0 --port $PORT
