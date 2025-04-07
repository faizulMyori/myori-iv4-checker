import React, { useState, useEffect } from 'react'
import TableWithPagination from '@/components/TableWithPagination'
import Footer from '@/components/template/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/FormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function Index() {
  const [licenses, setLicenses] = useState({
    data: [],
    total: 0,
    from: 0,
    to: 0,
    per_page: 0,
    current_page: 0,
    next_page_url: null,
    prev_page_url: null,
  })

  const initialState = {
    id: 0,
    code: '',
    name: '',
  }

  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [form, setForm] = useState(initialState);
  const [openForm, setOpenForm] = useState(false);
  const [deleteDialog, setOpenDeleteDialog] = useState(false);

  const columns = [
    {
      key: 'code',
      label: 'Code',
      hidden: false,
      render: (item: any) => (
        item.code
      )
    },
    {
      key: 'name',
      label: 'Name',
      hidden: false,
      render: (item: any) => (
        item.name
      )
    },
  ]

  const actions = [
    {
      permission: 'can:update:licenses',
      label: 'Edit',
      onClick: (item: any) => {
        setForm(item)
        setOpenForm(true)
        setFormType('update')
      },
    },
    {
      permission: 'can:delete:licenses',
      label: 'Delete',
      onClick: (item: any) => {
        setForm(item)
        setOpenDeleteDialog(true)
      },
    },
  ]

  const handleSearch = (query: string) => {
    try {
      window.sqlite.search_licenses(query).then((d: any) => {
        console.log(d)
        setLicenses({
          ...licenses,
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
    setForm(initialState)
    setOpenForm(true)
    setFormType('create')
  }

  const handleConfirmDelete = () => {
    try {
      window.sqlite.delete_license(form.id).then((d: any) => {
        setOpenDeleteDialog(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!deleteDialog || !openForm) {
      try {
        window.sqlite.get_licenses().then((d: any) => {
          setLicenses({
            ...licenses,
            data: d,
          })

          console.log(licenses)
        })
      } catch (error) {
        console.log(error)
      }
    }
  }, [openForm, deleteDialog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (formType === 'create') {
        const submitData: any = await window.sqlite.create_license(form);
        console.log(submitData)
        if (submitData) {
          setOpenForm(false);
        }
      } else {
        const submitData: any = await window.sqlite.update_license(form);
        if (submitData) {
          setOpenForm(false);
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
      <div className="flex flex-1 flex-col gap-2 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Licenses</h2>
        </div>
        <div className="flex flex-col gap-4">
          <TableWithPagination
            title="Licenses"
            description="Manage licenses and view their data."
            columns={columns}
            data={licenses?.data || []}
            pagination={{
              currentPage: licenses?.current_page || 1,
              perPage: licenses?.per_page || 10,
              total: licenses?.total || 0,
              from: licenses?.from || 0,
              to: licenses?.to || 0,
              nextUrl: licenses?.next_page_url || null,
              prevUrl: licenses?.prev_page_url || null,
            }}
            actions={actions || []}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onAdd={handleAdd}
            canAdd={true}
          />
        </div>
      </div>
      <Footer />

      {
        openForm && (
          <FormDialog
            setOpenForm={setOpenForm}
            openDialog={openForm}
            setConfirmForm={handleSubmit}
            title={`Create License`}
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
    </div>
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
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Enter name"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.name ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="code" className="text-right">
          Code
        </Label>
        <Input
          id="code"
          placeholder="Enter code"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.code ?? ""}
        />
      </div>
    </>
  );
}