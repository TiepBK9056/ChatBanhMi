﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BanhMi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddColumn_AvartarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "avartarUrl",
                table: "Conversation",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "avartarUrl",
                table: "Conversation");
        }
    }
}
