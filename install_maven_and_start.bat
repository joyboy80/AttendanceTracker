@echo off
echo Installing Maven for backend...

REM Create tools directory
if not exist "tools" mkdir tools
cd tools

REM Download Maven if not already present
if not exist "apache-maven-3.9.9" (
    echo Downloading Apache Maven 3.9.9...
    powershell -Command "Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile 'maven.zip'"
    
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path 'maven.zip' -DestinationPath '.'"
    del maven.zip
    echo Maven installed successfully!
) else (
    echo Maven already installed.
)

cd ..
echo Starting backend server...
cd Backend
..\tools\apache-maven-3.9.9\bin\mvn spring-boot:run