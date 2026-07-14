#!/usr/bin/env python3
"""Send the SEO loop's cycle report by email via Gmail SMTP.

Reads GMAIL_ADDRESS and GMAIL_APP_PASSWORD from .env.local (gitignored).
Usage: python3 send_seo_report.py "<subject>" "<body file path or ->"
"<-" reads the body from stdin instead of a file.
"""
import sys
import os
import smtplib
from email.mime.text import MIMEText

HERE = os.path.dirname(os.path.abspath(__file__))


def load_env_local():
    path = os.path.join(HERE, ".env.local")
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k] = v
    return env


def main():
    if len(sys.argv) != 3:
        print("Usage: send_seo_report.py <subject> <body_file_or_->", file=sys.stderr)
        sys.exit(1)

    subject, body_arg = sys.argv[1], sys.argv[2]
    body = sys.stdin.read() if body_arg == "-" else open(body_arg).read()

    env = load_env_local()
    sender = env["GMAIL_ADDRESS"]
    app_password = env["GMAIL_APP_PASSWORD"]
    recipient = env.get("REPORT_RECIPIENT", sender)

    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, app_password)
        server.sendmail(sender, [recipient], msg.as_string())

    print(f"Sent to {recipient}")


if __name__ == "__main__":
    main()
