# Generated by Django 5.0.6 on 2024-05-19 15:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_remove_driver_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='current_place',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
    ]
