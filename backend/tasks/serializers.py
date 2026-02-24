from rest_framework import serializers
from .models import Task
from accounts.models import UserPreferences


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'user', 'title', 'description', 'deadline', 'scheduled_date', 'duration_minutes', 'points_value', 'status', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')

    def validate(self, data):
        # validate scheduled_date against user preferences if provided
        user = self.context['request'].user
        prefs = getattr(user, 'preferences', None)
        warning = None
        scheduled_date = data.get('scheduled_date')
        deadline = data.get('deadline')
        if prefs and scheduled_date:
            off_days = prefs.off_days or []
            # scheduled_date is a date object
            if scheduled_date.strftime('%A') in off_days:
                # allow if deadline same date
                if not (deadline and deadline.date() == scheduled_date):
                    warning = 'scheduled_date_is_off_day'
                    # attach warning in serializer instance for view to read
                    self._warning = warning
        return data
