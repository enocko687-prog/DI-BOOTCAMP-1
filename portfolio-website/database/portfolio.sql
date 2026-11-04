IF DB_ID(N'EnockPortfolioDB') IS NULL
BEGIN
    CREATE DATABASE EnockPortfolioDB;
END;
GO

USE EnockPortfolioDB;
GO

IF OBJECT_ID(N'dbo.Projects', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Projects (
        ProjectID INT IDENTITY(1,1) PRIMARY KEY,
        ProjectName NVARCHAR(150) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Technologies NVARCHAR(250) NULL,
        ImageURL NVARCHAR(500) NULL,
        ProjectURL NVARCHAR(500) NULL,
        GitHubURL NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Projects_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.Skills', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Skills (
        SkillID INT IDENTITY(1,1) PRIMARY KEY,
        SkillName NVARCHAR(100) NOT NULL,
        Category NVARCHAR(100) NULL,
        SkillLevel NVARCHAR(50) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.Experience', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Experience (
        ExperienceID INT IDENTITY(1,1) PRIMARY KEY,
        Position NVARCHAR(150) NOT NULL,
        Organization NVARCHAR(150) NULL,
        Description NVARCHAR(MAX) NULL,
        StartDate DATE NULL,
        EndDate DATE NULL,
        IsCurrent BIT NOT NULL
            CONSTRAINT DF_Experience_IsCurrent DEFAULT 0
    );
END;
GO

IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactMessages (
        MessageID INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(120) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Subject NVARCHAR(200) NULL,
        Message NVARCHAR(2000) NOT NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_ContactMessages_CreatedAt DEFAULT SYSUTCDATETIME(),
        IsRead BIT NOT NULL
            CONSTRAINT DF_ContactMessages_IsRead DEFAULT 0
    );
END;
GO
