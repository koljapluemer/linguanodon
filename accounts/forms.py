from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from accounts.models import User


class StyledFormMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'input w-full'


class SignupForm(StyledFormMixin, UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User


class LoginForm(StyledFormMixin, AuthenticationForm):
    pass
