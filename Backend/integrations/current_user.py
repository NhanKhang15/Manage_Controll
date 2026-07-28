import threading

_state = threading.local()


def get_current_employee():
    return getattr(_state, 'employee', None)


def set_current_employee(employee):
    _state.employee = employee
