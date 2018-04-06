<td><%-name%></td>
<td>
	<span class="action-item">
		<input type="checkbox" <%= completed ? "checked" : ""%> data-toggle="toggle" data-width="110" class="toggle-btn">
	</span>	
	<span class="status-item"><%=completed ? "Completed" : "In-Complete"%></span>
</td>
<td><button class="btn btn-danger delete-task"><i class="fa fa-times"/></button></td>