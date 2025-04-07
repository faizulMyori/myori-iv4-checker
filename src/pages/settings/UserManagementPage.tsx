import React, { useState, useEffect, useContext } from 'react'
import TableWithPagination from '@/components/TableWithPagination'
import Footer from '@/components/template/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/FormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { UserContext } from '@/App'

export default function UserManagementPage() {
  const { user }: any = useContext(UserContext);

  const [users, setUsers] = useState({
    data: [],
    total: 0,
    from: 0,
    to: 0,
    per_page: 0,
    current_page: 0,
    next_page_url: null,
    prev_page_url: null,
  })

  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [form, setForm] = useState({
    id: 0,
    username: '',
    password: '',
  });
  const [openForm, setOpenForm] = useState(false);
  const [deleteDialog, setOpenDeleteDialog] = useState(false);

  const columns = [
    {
      key: 'name',
      label: 'Username',
      hidden: false,
      render: (item: any) => (
        item.username
      )
    },
    {
      key: 'created_at',
      label: 'Created At',
      hidden: false,
      render: (item: any) => (
        new Date(item.created_at).toLocaleDateString('en-GB')
      )
    }
  ]

  const actions = [
    {
      permission: 'can:update:users',
      label: 'Edit',
      onClick: (item: any) => {
        if (item.id === 1) return
        setForm({
          id: item.id,
          username: item.username,
          password: '',
        })
        setOpenForm(true)
        setFormType('update')
      },
    },
    {
      permission: 'can:delete:users',
      label: 'Delete',
      onClick: (item: any) => {
        if (item.id === 1) return
        setForm(item)
        setOpenDeleteDialog(true)
      },
    },
  ]

  const handleSearch = (query: string) => {
    try {
      window.sqlite.search_users(query).then((d: any) => {
        console.log(d)
        setUsers({
          ...users,
          data: d,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handlePageChange = (url: string) => {
    // router.get(url, {}, { preserveState: true })
  }

  const handleAdd = (e: React.MouseEvent) => {
    setOpenForm(true)
    setFormType('create')
  }

  const handleConfirmDelete = () => {
    try {
      window.sqlite.delete_user(form.id).then((d: any) => {
        setOpenDeleteDialog(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    try {
      window.sqlite.get_users().then((d: any) => {
        setUsers({
          ...users,
          data: d,
        })

        console.log(users)
      })
    } catch (error) {
      console.log(error)
    }
  }, [openForm, deleteDialog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (formType === 'create') {
        const submitData: any = await window.sqlite.create_user(form);
        console.log(submitData)
        if (submitData) {
          setOpenForm(false);
        }
      } else {
        const submitData: any = await window.sqlite.update_user(form);
        if (submitData) {
          setOpenForm(false);
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <TableWithPagination
        title="Users"
        description="Manage users and view their data."
        columns={columns}
        data={users?.data || []}
        pagination={{
          currentPage: users?.current_page || 1,
          perPage: users?.per_page || 10,
          total: users?.total || 0,
          from: users?.from || 0,
          to: users?.to || 0,
          nextUrl: users?.next_page_url || null,
          prevUrl: users?.prev_page_url || null,
        }}
        actions={actions || []}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onAdd={handleAdd}
        canAdd={user.id === 1}
      />

      {
        openForm && (
          <FormDialog
            setOpenForm={setOpenForm}
            openDialog={openForm}
            setConfirmForm={handleSubmit}
            title={`Create User`}
            forms={<Form data={form} setData={setForm} />}
            processing={false}
            size='lg:max-w-3xl'
          />
        )
      }

      {
        deleteDialog && (
          <ConfirmDialog
            open={deleteDialog}
            setConfirm={handleConfirmDelete}
            title="Confirm to delete?"
            setOpen={setOpenDeleteDialog}
          />
        )
      }
    </>
  )
}

function Form({ data, setData }: { data: any; setData: any }) {
  function updateInputValue(evt: any) {
    const val = evt.target.value;

    setData({
      ...data,
      [evt.target.id]: val,
    });
  }

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          placeholder="Enter username"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.username ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          placeholder="Enter password"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.password ?? ""}
        />
      </div>
    </>
  );
}