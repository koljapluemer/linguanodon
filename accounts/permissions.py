from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.mixins import UserPassesTestMixin


def is_admin(user):
    return user.is_authenticated and user.role == user.Role.ADMIN


role_required = user_passes_test(is_admin, login_url='accounts:login')


class AdminRequiredMixin(UserPassesTestMixin):
    login_url = 'accounts:login'

    def test_func(self):
        return is_admin(self.request.user)
