# Generated by Django 4.1 on 2024-01-28 16:35

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Anchor",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("code", models.CharField(max_length=20)),
                ("room_id", models.CharField(max_length=20)),
                ("authBody", models.CharField(max_length=1000)),
                ("lastGameId", models.CharField(max_length=20)),
            ],
        ),
    ]
