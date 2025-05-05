using billapi.Controllers;
//using billapi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<IBillRepository, BillRepository>();

var app = builder.Build();

app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapGet("/", () => "Hello World!");

//SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
    app.UseCors(x => x
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader()
        .WithOrigins("http://127.0.0.1:5500"));


app.Run();