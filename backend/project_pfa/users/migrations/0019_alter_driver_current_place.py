# Generated by Django 5.0.1 on 2024-05-21 11:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_trip_colis'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driver',
            name='current_place',
            field=models.JSONField(blank=True, default=list, null=True),
        ),
    ]
