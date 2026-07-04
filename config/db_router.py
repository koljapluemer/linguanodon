from django.conf import settings


class AppLabelRouter:
    """
    Routes any app whose app_label matches a configured DATABASES alias
    entirely to that alias (reads, writes, relations, migrations). Apps
    with no matching alias fall through to 'default'.

    This is the DB-side mirror of Django's AppDirectoriesFinder, which
    already auto-discovers <app>/static/<app>/... per installed app for
    free. Adding a future self-contained app with its own DB just means
    adding one more DATABASES entry named after its app_label - no router
    changes needed.
    """

    def _db_for_app(self, app_label):
        return app_label if app_label in settings.DATABASES else None

    def db_for_read(self, model, **hints):
        return self._db_for_app(model._meta.app_label)

    def db_for_write(self, model, **hints):
        return self._db_for_app(model._meta.app_label)

    def allow_relation(self, obj1, obj2, **hints):
        db1 = self._db_for_app(obj1._meta.app_label)
        db2 = self._db_for_app(obj2._meta.app_label)
        if db1 and db2:
            return db1 == db2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        target = self._db_for_app(app_label)
        if target is not None:
            return db == target
        return db == 'default'
