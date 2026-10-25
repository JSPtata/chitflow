import os
import uuid

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-only-secret-not-for-deployment"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.schema import CreateSchema, DropSchema

from app.main import app
from app.db.database import Base, get_db


@pytest.fixture
def client():
    # PostgreSQL uses a fresh random schema, never drops or resets user tables.
    url = os.environ.get("TEST_DATABASE_URL")
    schema = None
    if url:
        engine = create_engine(url.replace("postgresql://", "postgresql+psycopg2://", 1))
        assert engine.dialect.name == "postgresql", "TEST_DATABASE_URL must be PostgreSQL"
        schema = "chitflow_test_" + uuid.uuid4().hex
        with engine.begin() as connection:
            connection.execute(CreateSchema(schema))
        database = engine.execution_options(schema_translate_map={None: schema})
    else:
        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(engine, "connect")
        def enforce_foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
        database = engine
    Base.metadata.create_all(database)
    sessions = sessionmaker(bind=database)
    def override():
        with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = override
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        if schema:
            with engine.begin() as connection:
                connection.execute(DropSchema(schema, cascade=True))
        engine.dispose()
