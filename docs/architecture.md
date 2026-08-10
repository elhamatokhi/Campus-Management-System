# Architecture

## Overview

The Campus Event Management System will use a microservice architecture. Each backend service owns one business area, and the React frontend communicates with those services through REST APIs.

## Target Flow

```text
React Frontend
  -> User Service
  -> Event Service
  -> Booking Service
  -> PostgreSQL
```

Images will be stored outside the database in Azure Blob Storage. The database will store image URLs or references.

## Why Microservices?

Microservices make the project easier to explain as separate responsibilities:

- User Service handles identity and profiles.
- Event Service handles event data.
- Booking Service handles reservations.

This also demonstrates the cloud concepts required by the assignment: containerized services, orchestration, independent deployments, and REST communication.

