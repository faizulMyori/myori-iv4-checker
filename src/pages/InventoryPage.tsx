import React, { useState, useEffect } from 'react'
import TableWithPagination from '@/components/TableWithPagination'
import Footer from '@/components/template/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/FormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import ComboboxSelect from '@/components/ComboboxSelect'

export default function Index() {
  const [products, setProducts] = useState({
    data: [],
    total: 0,
    from: 0,
    to: 0,
    per_page: 0,
    current_page: 0,
    next_page_url: null,
    prev_page_url: null,
  })
  const [licenses, setLicenses] = useState([])
  const [formType, setFormType] = useState<'create' | 'update'>('create')

  const initialState = {
    id: 0,
    model: '',
    type: '',
    rating: '',
    size: '',
    brand: '',
    sku: '',
    license_id: ''
  };

  const [form, setForm] = useState(initialState);
  const [openForm, setOpenForm] = useState(false);
  const [deleteDialog, setOpenDeleteDialog] = useState(false);

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      hidden: false,
      render: (item: any) => (
        item.sku
      )
    },
    {
      key: 'model',
      label: 'Model',
      hidden: false,
      render: (item: any) => (
        item.model
      )
    },
    {
      key: 'type',
      label: 'Type',
      hidden: false,
      render: (item: any) => (
        item.type
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      hidden: false,
      render: (item: any) => (
        item.rating
      )
    },
  ]

  const actions = [
    {
      permission: 'can:update:products',
      label: 'Edit',
      onClick: (item: any) => {
        setForm(item)
        setOpenForm(true)
        setFormType('update')
      },
    },
    {
      permission: 'can:delete:products',
      label: 'Delete',
      onClick: (item: any) => {
        setForm(item)
        setOpenDeleteDialog(true)
      },
    },
  ]

  const handleSearch = (query: string) => {
    try {
      window.sqlite.search_products(query).then((d: any) => {
        console.log(d)
        setProducts({
          ...products,
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
      window.sqlite.delete_product(form.id).then((d: any) => {
        setOpenDeleteDialog(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!deleteDialog || !openForm) {
      try {
        window.sqlite.get_products().then((d: any) => {
          setProducts({
            ...products,
            data: d,
          })

          window.sqlite.get_licenses().then((l: any) => {
            console.log(l)
            setLicenses(l)
          })
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
        const submitData: any = await window.sqlite.create_product(form);
        if (submitData) {
          setOpenForm(false);
        }
      } else {
        const submitData: any = await window.sqlite.update_product(form);
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
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <div className="flex flex-col gap-4">
          <TableWithPagination
            title="Products"
            description="Manage products and view their data."
            columns={columns}
            data={products?.data || []}
            pagination={{
              currentPage: products?.current_page || 1,
              perPage: products?.per_page || 10,
              total: products?.total || 0,
              from: products?.from || 0,
              to: products?.to || 0,
              nextUrl: products?.next_page_url || null,
              prevUrl: products?.prev_page_url || null,
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
            title={`Create Product`}
            forms={<Form data={form} setData={setForm} licenses={licenses} />}
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

function Form({ data, setData, licenses }: { data: any; setData: any; licenses: any }) {
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
        <Label htmlFor="sku" className="text-right">
          SKU
        </Label>
        <Input
          id="sku"
          placeholder="Enter SKU"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.sku ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="brand" className="text-right">
          Brand
        </Label>
        <Input
          id="brand"
          placeholder="Enter Brand"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.brand ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="model" className="text-right">
          Model
        </Label>
        <Input
          id="model"
          placeholder="Enter model"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.model ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right">
          Type
        </Label>
        <Input
          id="type"
          placeholder="Enter type"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.type ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rating" className="text-right">
          Rating
        </Label>
        <Input
          id="rating"
          placeholder="Enter rating"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.rating ?? ""}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="size" className="text-right">
          Size (l)
        </Label>
        <Input
          id="size"
          placeholder="Enter size"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.size ?? ""}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="size" className="text-right">
          License
        </Label>
        <ComboboxSelect
          options={licenses}
          valueToDisplay={(value: any) => value.name}
          value={data.license_id.toString() ?? ""}
          onChange={(value) => setData({ ...data, license_id: value })}
          placeholder={"Select License"}
          disabled={false}
        />
      </div>
    </>
  );
}