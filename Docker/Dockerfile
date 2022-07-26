FROM python:3.8.3-slim as build
RUN apt-get update
RUN apt-get install -y --no-install-recommends \
build-essential gcc

WORKDIR /usr/recipicon
RUN python -m venv /usr/recipicon/venv
ENV PATH=/usr/recipicon/venv/bin:$PATH

COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.8.3-slim@sha256:938fd520a888e9dbac3de374b8ba495cc50fe96440030264a40f733052001895

RUN groupadd -g 9999 python && \
    useradd -r -u 9999 -g python python

RUN mkdir /usr/recipicon && chown python:python /usr/recipicon
WORKDIR /usr/recipicon

COPY  --chown=python:python --from=build /usr/recipicon/venv ./venv
COPY  --chown=python:python api ./api
COPY  --chown=python:python app ./app
COPY  --chown=python:python recipicon ./recipicon

USER 9999

ENV PATH=/usr/recipicon/venv/bin:$PATH

ENTRYPOINT ["gunicorn", "-c"]
