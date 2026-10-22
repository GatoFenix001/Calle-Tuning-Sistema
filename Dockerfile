# Etapa 1: construir la aplicación con Java 21 y Maven
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw -B -DskipTests package

# Etapa 2: ejecutar la aplicación
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]